const Lead = require('../models/lead');
const User = require('../models/user');
const mongoose = require('mongoose');
const emailService = require('../services/emailService');

// Create lead
exports.createLead = async (req, res, next) => {
  try {
    const { email, firstName, lastName, phone, source, interests } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Check if lead already exists
    let lead = await Lead.findOne({ email });
    
    if (lead) {
      // Update existing lead
      if (firstName) lead.firstName = firstName;
      if (lastName) lead.lastName = lastName;
      if (phone) lead.phone = phone;
      if (source) lead.source = source;
      if (interests) lead.interests = interests;
      
      lead.lastContactedAt = new Date();
      
      await lead.save();
      
      // Send follow-up email
      await emailService.sendLeadFollowUp(lead._id);
    } else {
      // Create new lead
      lead = new Lead({
        email,
        firstName,
        lastName,
        phone,
        source,
        interests,
        landingPage: req.headers.referer || '',
        lastContactedAt: new Date()
      });
      
      await lead.save();
      
      // Send welcome email with lead magnet
      if (source === 'free_guide') {
        await emailService.sendLeadMagnet(lead._id);
      } else {
        await emailService.sendLeadWelcome(lead._id);
      }
      
      // Notify admin
      await emailService.notifyAdminOfNewLead(lead._id);
    }
    
    res.status(201).json({
      success: true,
      data: {
        email: lead.email,
        source: lead.source
      }
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create lead'
    });
  }
};

// Get all leads (admin only)
exports.getLeads = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, source, search } = req.query;
    
    const query = {};
    
    if (status) {
      query.leadStatus = status;
    }
    
    if (source) {
      query.source = source;
    }
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Count total leads
    const total = await Lead.countDocuments(query);
    
    // Fetch leads with pagination
    const leads = await Lead.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: leads,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
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
    
    // Validate ID
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
    
    // Update lead fields
    if (status) {
      lead.leadStatus = status;
    }
    
    if (notes) {
      lead.notes = notes;
    }
    
    if (assignedTo) {
      // Validate assigned user exists and is admin
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser || assignedUser.role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Invalid assigned user'
        });
      }
      
      lead.assignedTo = assignedTo;
    }
    
    if (followUpDate) {
      lead.followUpDate = new Date(followUpDate);
    }
    
    lead.lastContactedAt = new Date();
    
    await lead.save();
    
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
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lead ID'
      });
    }
    
    if (!firebaseUid) {
      return res.status(400).json({
        success: false,
        message: 'Firebase UID is required'
      });
    }
    
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
        message: 'Lead is already converted'
      });
    }
    
    // Create or find user
    let user = await User.findOne({ firebaseUid });
    
    if (!user) {
      user = new User({
        firebaseUid,
        email: lead.email,
        firstName: lead.firstName || '',
        lastName: lead.lastName || '',
        phone: lead.phone || '',
        isSubscribedToEmails: true,
        source: lead.source,
        lastLoginAt: new Date()
      });
      
      await user.save();
    }
    
    // Update lead
    lead.convertedToUserId = user._id;
    lead.convertedAt = new Date();
    lead.leadStatus = 'converted';
    
    await lead.save();
    
    res.status(200).json({
      success: true,
      message: 'Lead converted successfully',
      data: {
        leadId: lead._id,
        userId: user._id
      }
    });
  } catch (error) {
    console.error('Error converting lead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to convert lead'
    });
  }
};