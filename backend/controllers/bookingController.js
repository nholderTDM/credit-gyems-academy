const Booking = require('../models/booking');
const User = require('../models/user');
const Service = require('../models/service');
const mongoose = require('mongoose');
const emailService = require('../services/emailService');
const calendarService = require('../services/calendarService');

// Get available time slots
exports.getAvailableTimeSlots = async (req, res, next) => {
  try {
    const { date, serviceType } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }
    
    // Get available time slots from calendar service
    const availableSlots = await calendarService.getAvailableTimeSlots(date, serviceType);
    
    res.status(200).json({
      success: true,
      data: availableSlots
    });
  } catch (error) {
    console.error('Error fetching available time slots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available time slots'
    });
  }
};

exports.createBooking = async (req, res, next) => {
  try {
    const { serviceType, startTime, serviceId, notes } = req.body;
    const userId = req.user._id;
    
    // If serviceId is provided, check if service exists FIRST
    if (serviceId) {
      const service = await Service.findById(serviceId);
      
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found'
        });
      }
    }
    
    // Then check required fields
    if (!serviceType || !startTime) {
      return res.status(400).json({
        success: false,
        message: 'Service type and start time are required'
      });
    }
    
    // Validate service type
    if (!['credit_repair', 'credit_coaching', 'financial_planning'].includes(serviceType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service type'
      });
    }
        
    // Get user details
    const user = await User.findById(userId);
    
    // Calculate end time (default duration: 60 minutes)
    const startDate = new Date(startTime);
    const endDate = new Date(startTime);
    endDate.setMinutes(endDate.getMinutes() + 60);
    
    // Verify that the slot is available
    const isAvailable = await calendarService.checkAvailability(startDate, endDate);
    
    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Selected time slot is not available'
      });
    }
    
    // Create event in calendar
    const calendarEvent = await calendarService.createEvent({
      summary: `${serviceType.replace('_', ' ')} - ${user.firstName} ${user.lastName}`,
      description: notes || '',
      startTime: startDate,
      endTime: endDate,
      attendee: user.email
    });
    
    // Create booking
    const booking = new Booking({
      userId,
      serviceType,
      startTime: startDate,
      endTime: endDate,
      customerName: `${user.firstName} ${user.lastName}`,
      customerEmail: user.email,
      customerPhone: user.phone,
      customerNotes: notes,
      calendarEventId: calendarEvent.id,
      meetingLink: calendarEvent.meetingLink
    });
    
    await booking.save();
    
    // Send confirmation email using SendGrid Dynamic Template
    try {
      await emailService.sendBookingConfirmation(booking._id);
      console.log('Booking confirmation email sent successfully');
    } catch (emailError) {
      console.error('Failed to send booking confirmation email:', emailError);
      // Don't fail the booking creation if email fails
    }
    
    res.status(201).json({
      success: true,
      data: booking,
      message: 'Booking created successfully. Confirmation email has been sent.'
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking'
    });
  }
};

// Get bookings for current user
exports.getUserBookings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    const bookings = await Booking.find({ userId })
      .sort({ startTime: 1 });
    
    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }
    
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Ensure the user owns this booking or is an admin
    if (booking.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this booking'
      });
    }
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking'
    });
  }
};

// Get calendar events for a booking
exports.getBookingCalendarEvents = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }
    
    const booking = await Booking.findById(id)
      .populate('userId', 'firstName lastName email');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Ensure the user owns this booking
    if (booking.userId._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this booking'
      });
    }
    
    // Generate calendar URLs
    const calendarUrls = emailService.generateCalendarUrls(booking, booking.userId);
    
    res.status(200).json({
      success: true,
      data: calendarUrls
    });
  } catch (error) {
    console.error('Error generating calendar events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate calendar events'
    });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { reason } = req.body;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }
    
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Ensure the user owns this booking or is an admin
    if (booking.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to cancel this booking'
      });
    }
    
    // Check if booking is already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }
    
    // Check if booking is in the past
    if (new Date(booking.startTime) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel past bookings'
      });
    }
    
    // Update booking status
    booking.status = 'cancelled';
    booking.cancellationReason = reason || '';
    
    await booking.save();
    
    // Cancel calendar event
    if (booking.calendarEventId) {
      try {
        await calendarService.cancelEvent(booking.calendarEventId);
      } catch (calendarError) {
        console.error('Failed to cancel calendar event:', calendarError);
        // Don't fail the booking cancellation if calendar fails
      }
    }
    
    // Send cancellation email
    try {
      await emailService.sendBookingCancellation(booking._id);
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
      // Don't fail the booking cancellation if email fails
    }
    
    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking'
    });
  }
};

// Reschedule booking
exports.rescheduleBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { startTime } = req.body;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }
    
    if (!startTime) {
      return res.status(400).json({
        success: false,
        message: 'New start time is required'
      });
    }
    
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Ensure the user owns this booking or is an admin
    if (booking.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to reschedule this booking'
      });
    }
    
    // Check if booking is cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot reschedule cancelled booking'
      });
    }
    
    // Check if booking is in the past
    if (new Date(booking.startTime) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reschedule past bookings'
      });
    }
    
    // Calculate new end time
    const newStartDate = new Date(startTime);
    const newEndDate = new Date(startTime);
    newEndDate.setMinutes(newEndDate.getMinutes() + 60);
    
    // Verify that the new slot is available
    const isAvailable = await calendarService.checkAvailability(newStartDate, newEndDate);
    
    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Selected time slot is not available'
      });
    }
    
    // Update calendar event
    if (booking.calendarEventId) {
      try {
        await calendarService.updateEvent(booking.calendarEventId, {
          startTime: newStartDate,
          endTime: newEndDate
        });
      } catch (calendarError) {
        console.error('Failed to update calendar event:', calendarError);
        // Continue with booking update even if calendar fails
      }
    }
    
    // Update booking
    booking.startTime = newStartDate;
    booking.endTime = newEndDate;
    
    await booking.save();
    
    // Send rescheduling email (you'll need to create this function)
    try {
      await emailService.sendBookingConfirmation(booking._id);
    } catch (emailError) {
      console.error('Failed to send rescheduling email:', emailError);
      // Don't fail the booking update if email fails
    }
    
    res.status(200).json({
      success: true,
      data: booking,
      message: 'Booking rescheduled successfully'
    });
  } catch (error) {
    console.error('Error rescheduling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reschedule booking'
    });
  }
};

// Get all bookings (admin only)
exports.getAllBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    // Count total bookings
    const total = await Booking.countDocuments(query);
    
    // Fetch bookings with pagination
    const bookings = await Booking.find(query)
      .sort({ startTime: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
};

// Update booking status (admin only)
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }
    
    // Validate status
    const validStatuses = ['scheduled', 'cancelled', 'completed', 'no_show'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }
    
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Update status
    booking.status = status;
    await booking.save();
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status'
    });
  }
};

// Get blackout dates
exports.getBlackoutDates = async (req, res, next) => {
  try {
    const blackoutDates = [
      { date: '2025-12-25', reason: 'Christmas Day' },
      { date: '2026-01-01', reason: 'New Year\'s Day' }
    ];
    
    res.status(200).json({
      success: true,
      data: blackoutDates
    });
  } catch (error) {
    console.error('Error fetching blackout dates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blackout dates'
    });
  }
};

// Debug: List all exports
console.log('📋 BookingController exports:', Object.keys(module.exports));