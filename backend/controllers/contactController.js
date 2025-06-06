// backend/controllers/contactController.js

const Lead = require('../models/lead');
const emailService = require('../services/emailService');
const validator = require('validator');

// Handle contact form submissions
exports.submitContactForm = async (req, res) => {
  try {
    const { email, firstName, lastName, phone, message, subject } = req.body;
    
    // Validate required fields
    if (!email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Email and message are required'
      });
    }
    
    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    
    // Create or update lead
    const leadData = {
      email: validator.normalizeEmail(email.toLowerCase().trim()),
      firstName: firstName ? validator.escape(firstName.trim()) : '',
      lastName: lastName ? validator.escape(lastName.trim()) : '',
      phone: phone ? phone.replace(/[^\d\s\-\+\(\)]/g, '') : '',
      source: 'contact_form', // This is now a valid enum value
      interests: ['contact_inquiry'],
      notes: `Contact Form Submission - Subject: ${subject || 'General Inquiry'}\nMessage: ${message}`
    };
    
    let lead = await Lead.findOne({ email: leadData.email });
    
    if (lead) {
      // Update existing lead
      if (leadData.firstName && !lead.firstName) lead.firstName = leadData.firstName;
      if (leadData.lastName && !lead.lastName) lead.lastName = leadData.lastName;
      if (leadData.phone && !lead.phone) lead.phone = leadData.phone;
      
      // Add interaction
      lead.interactions.push({
        type: 'form_submission',
        description: `Contact form: ${subject || 'General Inquiry'}`,
        date: new Date()
      });
      
      // Append to notes
      lead.notes = lead.notes ? 
        `${lead.notes}\n\n---\n${leadData.notes}` : 
        leadData.notes;
      
      await lead.save();
    } else {
      // Create new lead
      lead = new Lead({
        ...leadData,
        interactions: [{
          type: 'form_submission',
          description: `Contact form: ${subject || 'General Inquiry'}`,
          date: new Date()
        }]
      });
      
      await lead.save();
    }
    
    // Send confirmation email to user (async)
    setImmediate(async () => {
      try {
        // You can create a specific contact form confirmation email method
        await emailService.sendLeadWelcome(lead._id);
      } catch (error) {
        console.error('Error sending contact confirmation:', error);
      }
    });
    
    // Notify admin (async)
    setImmediate(async () => {
      try {
        await emailService.notifyAdminOfNewLead(lead._id);
      } catch (error) {
        console.error('Error notifying admin:', error);
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Thank you for contacting us. We will get back to you soon!',
      data: {
        email: lead.email
      }
    });
    
  } catch (error) {
    console.error('Error processing contact form:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        ...(process.env.NODE_ENV === 'development' && { errors })
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form'
    });
  }
};