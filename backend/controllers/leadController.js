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
      return res.status(400).json({
        success: false,
        message: 'Invalid input data'
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