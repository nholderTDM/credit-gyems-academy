const Lead = require('../models/lead');
const User = require('../models/user');
const mongoose = require('mongoose');
const validator = require('validator');
const emailService = require('../services/emailService');
const { addLeadToSheet } = require('../services/analytics'); // Optional Google Sheets integration

// Create lead with enhanced security and validation
exports.createLead = async (req, res, next) => {
  try {
    const { email, firstName, lastName, phone, source, interests } = req.body;
    
    // Validate required fields
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    
    // Sanitize and validate input data
    const sanitizedData = {
      email: validator.normalizeEmail(email.toLowerCase().trim()),
      firstName: firstName ? validator.escape(firstName.trim()) : '',
      lastName: lastName ? validator.escape(lastName.trim()) : '',
      phone: phone ? phone.replace(/[^\d\s\-\+\(\)]/g, '') : '', // Only allow phone characters
      source: source || 'website',
      interests: Array.isArray(interests) ? interests.filter(i => typeof i === 'string' && i.length > 0) : [],
      landingPage: req.headers.referer || ''
    };
    
    // Additional validation
    if (sanitizedData.firstName && sanitizedData.firstName.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'First name is too long'
      });
    }
    
    if (sanitizedData.lastName && sanitizedData.lastName.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Last name is too long'
      });
    }
    
    if (sanitizedData.phone && sanitizedData.phone.length > 20) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is too long'
      });
    }
    
    // Check if lead already exists
    let lead = await Lead.findOne({ email: sanitizedData.email });
    
    if (lead) {
      // Update existing lead with new information
      let updated = false;
      
      if (sanitizedData.firstName && !lead.firstName) {
        lead.firstName = sanitizedData.firstName;
        updated = true;
      }
      if (sanitizedData.lastName && !lead.lastName) {
        lead.lastName = sanitizedData.lastName;
        updated = true;
      }
      if (sanitizedData.phone && !lead.phone) {
        lead.phone = sanitizedData.phone;
        updated = true;
      }
      if (sanitizedData.source && sanitizedData.source !== 'website') {
        lead.source = sanitizedData.source;
        updated = true;
      }
      if (sanitizedData.interests.length > 0) {
        // Merge interests without duplicates
        const mergedInterests = [...new Set([...lead.interests, ...sanitizedData.interests])];
        if (mergedInterests.length !== lead.interests.length) {
          lead.interests = mergedInterests;
          updated = true;
        }
      }
      
      if (updated) {
        lead.lastContactedAt = new Date();
        await lead.save();
        
        // Send follow-up email only if significantly updated
        try {
          await emailService.sendLeadFollowUp(lead._id);
        } catch (emailError) {
          console.error('Error sending follow-up email:', emailError);
          // Don't fail the request if email fails
        }
      }
      
      return res.status(200).json({
        success: true,
        message: 'Thank you! Your information has been updated.',
        data: {
          email: lead.email,
          source: lead.source,
          isExisting: true
        }
      });
    } else {
      // Create new lead
      lead = new Lead({
        ...sanitizedData,
        lastContactedAt: new Date()
      });
      
      await lead.save();
      
      // Async operations (don't wait for completion to avoid blocking response)
      setImmediate(async () => {
        try {
          // Send appropriate email based on source
          if (sanitizedData.source === 'free_guide') {
            await emailService.sendLeadMagnet(lead._id);
          } else {
            await emailService.sendLeadWelcome(lead._id);
          }
          
          // Notify admin
          await emailService.notifyAdminOfNewLead(lead._id);
          
          // Add to Google Sheets (if configured)
          if (typeof addLeadToSheet === 'function') {
            await addLeadToSheet(lead);
          }
        } catch (asyncError) {
          console.error('Error in async lead processing:', asyncError);
        }
      });
      
      return res.status(201).json({
        success: true,
        message: 'Thank you for your interest! Check your email for next steps.',
        data: {
          email: lead.email,
          source: lead.source,
          isExisting: false
        }
      });
    }
  } catch (error) {
    console.error('Error creating lead:', error);
    
    // Don't expose internal errors to client
    if (error.name === 'ValidationError') {
      // In development, show detailed validation errors
      const errors = Object.values(error.errors).map(e => e.message);
      console.error('Validation errors:', errors);
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        ...(process.env.NODE_ENV === 'development' && { errors })
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  }
};

// Get all leads (admin only)
exports.getLeads = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      source, 
      search,
      startDate,
      endDate,
      assignedTo
    } = req.query;
    
    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Cap at 100
    
    const query = {};
    
    // Build query filters with validation
    if (status) {
      const validStatuses = ['new', 'contacted', 'qualified', 'converted', 'lost'];
      if (validStatuses.includes(status)) {
        query.leadStatus = status;
      }
    }
    
    if (source) {
      query.source = validator.escape(source);
    }
    
    if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
      query.assignedTo = assignedTo;
    }
    
    // Date range filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        query.createdAt = {
          $gte: start,
          $lte: end
        };
      }
    }
    
    // Search functionality with sanitization
    if (search) {
      const sanitizedSearch = validator.escape(search.trim());
      if (sanitizedSearch.length > 0) {
        query.$or = [
          { email: { $regex: sanitizedSearch, $options: 'i' } },
          { firstName: { $regex: sanitizedSearch, $options: 'i' } },
          { lastName: { $regex: sanitizedSearch, $options: 'i' } },
          { phone: { $regex: sanitizedSearch, $options: 'i' } }
        ];
      }
    }
    
    // Count total leads
    const total = await Lead.countDocuments(query);
    
    // Fetch leads with pagination
    const leads = await Lead.find(query)
      .populate('assignedTo', 'firstName lastName email')
      .populate('convertedToUserId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .select('-__v'); // Exclude version field
    
    res.status(200).json({
      success: true,
      data: leads,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leads'
    });
  }
};

// Update lead status (admin only)
exports.updateLeadStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes, assignedTo, followUpDate } = req.body;
    
    // Validate lead ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lead ID'
      });
    }
    
    const lead = await Lead.findById(id);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }
    
    // Update lead fields with validation
    if (status) {
      const validStatuses = ['new', 'contacted', 'qualified', 'converted', 'lost'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value'
        });
      }
      lead.leadStatus = status;
    }
    
    if (notes) {
      const sanitizedNotes = validator.escape(notes.trim());
      if (sanitizedNotes.length > 1000) {
        return res.status(400).json({
          success: false,
          message: 'Notes are too long (max 1000 characters)'
        });
      }
      lead.notes = sanitizedNotes;
    }
    
    if (assignedTo) {
      // Validate assigned user exists and is admin
      if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid assigned user ID'
        });
      }
      
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser || assignedUser.role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Invalid assigned user or user is not an admin'
        });
      }
      
      lead.assignedTo = assignedTo;
    }
    
    if (followUpDate) {
      const followUp = new Date(followUpDate);
      if (isNaN(followUp.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid follow-up date'
        });
      }
      
      // Don't allow follow-up dates in the past
      if (followUp < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Follow-up date cannot be in the past'
        });
      }
      
      lead.followUpDate = followUp;
    }
    
    lead.lastContactedAt = new Date();
    
    await lead.save();
    
    // Update Google Sheets (async, don't wait)
    if (typeof addLeadToSheet === 'function') {
      setImmediate(async () => {
        try {
          await addLeadToSheet(lead);
        } catch (sheetError) {
          console.error('Error updating Google Sheet:', sheetError);
        }
      });
    }
    
    // Populate references for response
    await lead.populate('assignedTo', 'firstName lastName email');
    await lead.populate('convertedToUserId', 'firstName lastName email');
    
    res.status(200).json({
      success: true,
      data: lead
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update lead'
    });
  }
};

// Convert lead to user (admin only)
exports.convertLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firebaseUid } = req.body;
    
    // Validate lead ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lead ID'
      });
    }
    
    // Validate Firebase UID
    if (!firebaseUid || typeof firebaseUid !== 'string' || firebaseUid.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Firebase UID is required'
      });
    }
    
    const sanitizedFirebaseUid = firebaseUid.trim();
    
    const lead = await Lead.findById(id);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }
    
    // Check if lead is already converted
    if (lead.convertedToUserId) {
      return res.status(400).json({
        success: false,
        message: 'Lead is already converted',
        data: {
          leadId: lead._id,
          userId: lead.convertedToUserId
        }
      });
    }
    
    // Check if Firebase UID is already in use
    const existingUserWithUid = await User.findOne({ firebaseUid: sanitizedFirebaseUid });
    if (existingUserWithUid) {
      return res.status(400).json({
        success: false,
        message: 'Firebase UID is already associated with another user'
      });
    }
    
    // Check if email is already in use
    const existingUserWithEmail = await User.findOne({ email: lead.email });
    if (existingUserWithEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email is already associated with another user'
      });
    }
    
    // Create new user
    const user = new User({
      firebaseUid: sanitizedFirebaseUid,
      email: lead.email,
      firstName: lead.firstName || '',
      lastName: lead.lastName || '',
      phone: lead.phone || '',
      isSubscribedToEmails: true,
      source: lead.source,
      lastLoginAt: new Date()
    });
    
    await user.save();
    
    // Update lead
    lead.convertedToUserId = user._id;
    lead.convertedAt = new Date();
    lead.leadStatus = 'converted';
    lead.lastContactedAt = new Date();
    
    await lead.save();
    
    // Send conversion notification (async)
    setImmediate(async () => {
      try {
        if (emailService.sendUserConversionNotification) {
          await emailService.sendUserConversionNotification(user._id);
        }
        
        // Update Google Sheets
        if (typeof addLeadToSheet === 'function') {
          await addLeadToSheet(lead);
        }
      } catch (asyncError) {
        console.error('Error in async conversion processing:', asyncError);
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Lead converted successfully',
      data: {
        leadId: lead._id,
        userId: user._id,
        userEmail: user.email
      }
    });
  } catch (error) {
    console.error('Error converting lead:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user data'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to convert lead'
    });
  }
};

// Get lead by ID (admin only)
exports.getLeadById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate lead ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lead ID'
      });
    }
    
    const lead = await Lead.findById(id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('convertedToUserId', 'firstName lastName email');
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: lead
    });
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lead'
    });
  }
};

// Delete lead (admin only)
exports.deleteLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate lead ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lead ID'
      });
    }
    
    const lead = await Lead.findById(id);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }
    
    // Don't allow deletion of converted leads
    if (lead.convertedToUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete converted leads'
      });
    }
    
    await Lead.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete lead'
    });
  }
};

// Get lead statistics (admin only)
exports.getLeadStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = {};
    
    // Date filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        matchStage.createdAt = {
          $gte: start,
          $lte: end
        };
      }
    }
    
    const stats = await Lead.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalLeads: { $sum: 1 },
          newLeads: {
            $sum: {
              $cond: [{ $eq: ['$leadStatus', 'new'] }, 1, 0]
            }
          },
          contactedLeads: {
            $sum: {
              $cond: [{ $eq: ['$leadStatus', 'contacted'] }, 1, 0]
            }
          },
          qualifiedLeads: {
            $sum: {
              $cond: [{ $eq: ['$leadStatus', 'qualified'] }, 1, 0]
            }
          },
          convertedLeads: {
            $sum: {
              $cond: [{ $eq: ['$leadStatus', 'converted'] }, 1, 0]
            }
          },
          lostLeads: {
            $sum: {
              $cond: [{ $eq: ['$leadStatus', 'lost'] }, 1, 0]
            }
          }
        }
      }
    ]);
    
    const leadsBySource = await Lead.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    const result = stats[0] || {
      totalLeads: 0,
      newLeads: 0,
      contactedLeads: 0,
      qualifiedLeads: 0,
      convertedLeads: 0,
      lostLeads: 0
    };
    
    // Calculate conversion rate
    result.conversionRate = result.totalLeads > 0 ? 
      ((result.convertedLeads / result.totalLeads) * 100).toFixed(2) : 0;
    
    res.status(200).json({
      success: true,
      data: {
        overview: result,
        bySource: leadsBySource
      }
    });
  } catch (error) {
    console.error('Error fetching lead stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lead statistics'
    });
  }
};

// Subscribe to newsletter
exports.subscribeNewsletter = async (req, res, next) => {
  try {
    const { email, firstName, lastName } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    
    const sanitizedData = {
      email: validator.normalizeEmail(email.toLowerCase().trim()),
      firstName: firstName ? validator.escape(firstName.trim()) : '',
      lastName: lastName ? validator.escape(lastName.trim()) : '',
      source: 'website', // Fixed - using valid enum value
      interests: ['newsletter'],
      isSubscribedToEmails: true
    };
    
    let lead = await Lead.findOne({ email: sanitizedData.email });
    
    if (lead) {
      lead.isSubscribedToEmails = true;
      lead.emailOptOutDate = null;
      
      if (sanitizedData.firstName && !lead.firstName) {
        lead.firstName = sanitizedData.firstName;
      }
      if (sanitizedData.lastName && !lead.lastName) {
        lead.lastName = sanitizedData.lastName;
      }
      
      if (!lead.interests.includes('newsletter')) {
        lead.interests.push('newsletter');
      }
      
      await lead.save();
      
      return res.status(200).json({
        success: true,
        message: 'Successfully subscribed to newsletter!',
        data: {
          email: lead.email,
          isExisting: true
        }
      });
    } else {
      lead = new Lead(sanitizedData);
      await lead.save();
      
      setImmediate(async () => {
        try {
          await emailService.sendLeadWelcome(lead._id);
        } catch (error) {
          console.error('Error sending welcome email:', error);
        }
      });
      
      return res.status(201).json({
        success: true,
        message: 'Successfully subscribed to newsletter!',
        data: {
          email: lead.email,
          isExisting: false
        }
      });
    }
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    
    if (error.name === 'ValidationError') {
      // In development, show detailed validation errors
      const errors = Object.values(error.errors).map(e => e.message);
      console.error('Validation errors:', errors);
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        ...(process.env.NODE_ENV === 'development' && { errors })
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to subscribe to newsletter'
    });
  }
};

// Download guide
exports.downloadGuide = async (req, res, next) => {
  try {
    const { email, firstName, lastName, guideId } = req.body;
    
    if (!email || !guideId) {
      return res.status(400).json({
        success: false,
        message: 'Email and guide ID are required'
      });
    }
    
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    
    const sanitizedData = {
      email: validator.normalizeEmail(email.toLowerCase().trim()),
      firstName: firstName ? validator.escape(firstName.trim()) : '',
      lastName: lastName ? validator.escape(lastName.trim()) : '',
      source: 'free_guide',
      interests: ['guides', 'educational_content']
    };
    
    let lead = await Lead.findOne({ email: sanitizedData.email });
    
    if (lead) {
      if (sanitizedData.firstName && !lead.firstName) {
        lead.firstName = sanitizedData.firstName;
      }
      if (sanitizedData.lastName && !lead.lastName) {
        lead.lastName = sanitizedData.lastName;
      }
      
      // Fix: Don't validate guideId as ObjectId, store as string
      const guideEntry = {
        guideId: guideId.toString(), // Store as string
        downloadedAt: new Date()
      };
      
      // Check if guide already downloaded
      const alreadyDownloaded = lead.downloadedGuides.some(g => 
        g.guideId && g.guideId.toString() === guideId.toString()
      );
      
      if (!alreadyDownloaded) {
        lead.downloadedGuides.push(guideEntry);
      }
      
      const newInterests = ['guides', 'educational_content'];
      newInterests.forEach(interest => {
        if (!lead.interests.includes(interest)) {
          lead.interests.push(interest);
        }
      });
      
      lead.interactions.push({
        type: 'download',
        description: `Downloaded guide: ${guideId}`,
        date: new Date()
      });
      
      await lead.save();
    } else {
      // Create new lead with proper guide tracking
      lead = new Lead({
        ...sanitizedData,
        downloadedGuides: [{
          guideId: guideId.toString(), // Store as string
          downloadedAt: new Date()
        }],
        interactions: [{
          type: 'download',
          description: `Downloaded guide: ${guideId}`,
          date: new Date()
        }]
      });
      
      await lead.save();
    }
    
    setImmediate(async () => {
      try {
        await emailService.sendLeadMagnet(lead._id);
      } catch (error) {
        console.error('Error sending lead magnet:', error);
      }
    });
    
    return res.status(200).json({
      success: true,
      message: 'Guide will be sent to your email!',
      data: {
        email: lead.email,
        downloadUrl: `/guides/${guideId}`
      }
    });
  } catch (error) {
    console.error('Error processing guide download:', error);
    
    if (error.name === 'ValidationError') {
      // In development, show detailed validation errors
      const errors = Object.values(error.errors).map(e => e.message);
      console.error('Validation errors:', errors);
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        ...(process.env.NODE_ENV === 'development' && { errors })
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to process download request'
    });
  }
};

// Get lead analytics (admin only)
exports.getLeadAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        if (!isNaN(start.getTime())) {
          matchStage.createdAt.$gte = start;
        }
      }
      if (endDate) {
        const end = new Date(endDate);
        if (!isNaN(end.getTime())) {
          matchStage.createdAt.$lte = end;
        }
      }
    }
    
    const overview = await Lead.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalLeads: { $sum: 1 },
          convertedLeads: {
            $sum: { $cond: [{ $ne: ['$convertedToUserId', null] }, 1, 0] }
          },
          averageLeadScore: { $avg: '$leadScore' },
          emailSubscribers: {
            $sum: { $cond: ['$isSubscribedToEmails', 1, 0] }
          }
        }
      }
    ]);
    
    const bySource = await Lead.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
          converted: {
            $sum: { $cond: [{ $ne: ['$convertedToUserId', null] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          source: '$_id',
          count: 1,
          converted: 1,
          conversionRate: {
            $multiply: [
              { $divide: ['$converted', '$count'] },
              100
            ]
          }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    let dateGrouping;
    switch (groupBy) {
      case 'hour':
        dateGrouping = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          hour: { $hour: '$createdAt' }
        };
        break;
      case 'day':
        dateGrouping = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case 'week':
        dateGrouping = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      case 'month':
        dateGrouping = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      default:
        dateGrouping = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
    }
    
    const timeline = await Lead.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: dateGrouping,
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    const funnel = await Lead.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$leadStatus',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const analytics = {
      overview: overview[0] || {
        totalLeads: 0,
        convertedLeads: 0,
        averageLeadScore: 0,
        emailSubscribers: 0
      },
      bySource,
      timeline,
      funnel: funnel.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {
        new: 0,
        contacted: 0,
        qualified: 0,
        converted: 0,
        lost: 0
      })
    };
    
    if (analytics.overview.totalLeads > 0) {
      analytics.overview.conversionRate = 
        (analytics.overview.convertedLeads / analytics.overview.totalLeads * 100).toFixed(2);
    } else {
      analytics.overview.conversionRate = 0;
    }
    
    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching lead analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
};

// Export leads (admin only)
exports.exportLeads = async (req, res, next) => {
  try {
    const { format = 'json', status, source, startDate, endDate } = req.query;
    
    const query = {};
    
    if (status) {
      query.leadStatus = status;
    }
    
    if (source) {
      query.source = source;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }
    
    const leads = await Lead.find(query)
      .select('-__v -interactions')
      .populate('assignedTo', 'firstName lastName email')
      .populate('convertedToUserId', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    if (format === 'csv') {
      const fields = [
        'email',
        'firstName',
        'lastName',
        'phone',
        'source',
        'leadStatus',
        'leadScore',
        'createdAt',
        'convertedAt',
        'assignedTo',
        'notes'
      ];
      
      let csv = fields.join(',') + '\n';
      
      leads.forEach(lead => {
        const row = fields.map(field => {
          let value = lead[field];
          
          if (field === 'assignedTo' && lead.assignedTo) {
            value = lead.assignedTo.email;
          }
          
          if (value instanceof Date) {
            value = value.toISOString();
          }
          
          if (value && typeof value === 'string') {
            value = value.replace(/"/g, '""');
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
              value = `"${value}"`;
            }
          }
          
          return value || '';
        });
        
        csv += row.join(',') + '\n';
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=leads-export.csv');
      
      return res.send(csv);
    } else {
      res.status(200).json({
        success: true,
        count: leads.length,
        data: leads
      });
    }
  } catch (error) {
    console.error('Error exporting leads:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export leads'
    });
  }
};
