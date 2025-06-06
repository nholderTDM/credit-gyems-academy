const Consultation = require('../models/consultation');
const User = require('../models/user');
const { createCalendarEvent, deleteCalendarEvent } = require('../services/calendar');
const { sendBookingConfirmation, sendBookingReminder } = require('../services/email');

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
    
    // Convert date string to Date object
    const selectedDate = new Date(date);
    
    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointments in the past'
      });
    }
    
    // Define business hours
    const businessHours = {
      start: 9, // 9 AM
      end: 17  // 5 PM
    };
    
    // Get existing bookings for the selected date
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const existingBookings = await Consultation.find({
      startTime: { $gte: startOfDay, $lt: endOfDay },
      status: { $in: ['scheduled', 'confirmed'] }
    });
    
    // Get blackout times from calendar
    const blackoutTimes = await getBlackoutTimes(selectedDate);
    
    // Generate available time slots (30-minute intervals)
    const availableSlots = [];
    const slotDuration = 30; // minutes
    
    for (let hour = businessHours.start; hour < businessHours.end; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotTime = new Date(selectedDate);
        slotTime.setHours(hour, minute, 0, 0);
        
        // Skip times in the past
        if (slotTime <= new Date()) {
          continue;
        }
        
        // Calculate slot end time
        const slotEndTime = new Date(slotTime);
        slotEndTime.setMinutes(slotEndTime.getMinutes() + slotDuration);
        
        // Check if slot conflicts with existing bookings
        const isBooked = existingBookings.some(booking => {
          const bookingStart = new Date(booking.startTime);
          const bookingEnd = new Date(booking.endTime);
          
          return (
            (slotTime >= bookingStart && slotTime < bookingEnd) ||
            (slotEndTime > bookingStart && slotEndTime <= bookingEnd) ||
            (slotTime <= bookingStart && slotEndTime >= bookingEnd)
          );
        });
        
        // Check if slot conflicts with blackout times
        const isBlackedOut = blackoutTimes.some(blackout => {
          return (
            (slotTime >= blackout.start && slotTime < blackout.end) ||
            (slotEndTime > blackout.start && slotEndTime <= blackout.end) ||
            (slotTime <= blackout.start && slotEndTime >= blackout.end)
          );
        });
        
        if (!isBooked && !isBlackedOut) {
          availableSlots.push({
            startTime: slotTime.toISOString(),
            endTime: slotEndTime.toISOString(),
            duration: slotDuration
          });
        }
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        date: selectedDate.toISOString(),
        serviceType: serviceType || 'all',
        availableSlots
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create booking
exports.createBooking = async (req, res, next) => {
  try {
    const { serviceType, startTime, notes } = req.body;
    const userId = req.user.id;
    
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
    
    // Convert startTime to Date
    const bookingStartTime = new Date(startTime);
    
    // Check if start time is in the past
    if (bookingStartTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointments in the past'
      });
    }
    
    // Get user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Calculate end time (default 60 min consultation)
    const bookingEndTime = new Date(bookingStartTime);
    bookingEndTime.setMinutes(bookingEndTime.getMinutes() + 60);
    
    // Check if this time slot is available
    const startOfDay = new Date(bookingStartTime);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(bookingStartTime);
    endOfDay.setHours(23, 59, 59, 999);
    
    const existingBookings = await Consultation.find({
      startTime: { $gte: startOfDay, $lt: endOfDay },
      status: { $in: ['scheduled', 'confirmed'] }
    });
    
    // Check if slot conflicts with existing bookings
    const isBooked = existingBookings.some(booking => {
      const existingStart = new Date(booking.startTime);
      const existingEnd = new Date(booking.endTime);
      
      return (
        (bookingStartTime >= existingStart && bookingStartTime < existingEnd) ||
        (bookingEndTime > existingStart && bookingEndTime <= existingEnd) ||
        (bookingStartTime <= existingStart && bookingEndTime >= existingEnd)
      );
    });
    
    if (isBooked) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is no longer available'
      });
    }
    
    // Create calendar event
    let calendarEventId;
    let meetingLink;
    
    try {
      const calendarResult = await createCalendarEvent({
        summary: `${serviceType.replace(/_/g, ' ')} Consultation - ${user.firstName} ${user.lastName}`,
        description: notes || '',
        startTime: bookingStartTime,
        endTime: bookingEndTime,
        attendeeEmail: user.email
      });
      
      calendarEventId = calendarResult.id;
      meetingLink = calendarResult.meetingLink;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      // Continue without calendar integration if it fails
    }
    
    // Set price based on service type
    let price;
    switch (serviceType) {
      case 'credit_repair':
        price = 99.99;
        break;
      case 'credit_coaching':
        price = 149.99;
        break;
      case 'financial_planning':
        price = 199.99;
        break;
      default:
        price = 99.99;
    }
    
    // Create booking
    const consultation = new Consultation({
      userId,
      serviceType,
      startTime: bookingStartTime,
      endTime: bookingEndTime,
      duration: 60,
      timeZone: 'America/New_York', // Can be dynamic based on user preferences
      status: 'scheduled',
      price,
      customerName: `${user.firstName} ${user.lastName}`,
      customerEmail: user.email,
      customerPhone: user.phone,
      customerNotes: notes,
      calendarEventId,
      meetingLink
    });
    
    await consultation.save();
    
    // Send confirmation email
    try {
      await sendBookingConfirmation(consultation._id);
    } catch (error) {
      console.error('Error sending booking confirmation:', error);
      // Continue even if email fails
    }
    
    res.status(201).json({
      success: true,
      data: consultation
    });
  } catch (error) {
    next(error);
  }
};

// Get user consultations
exports.getUserConsultations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const consultations = await Consultation.find({ userId })
      .sort({ startTime: 1 });
    
    res.status(200).json({
      success: true,
      data: consultations
    });
  } catch (error) {
    next(error);
  }
};

// Get consultation by ID
exports.getConsultation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const consultation = await Consultation.findById(id);
    
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }
    
    // Check if user owns this consultation or is admin
    if (consultation.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    res.status(200).json({
      success: true,
      data: consultation
    });
  } catch (error) {
    next(error);
  }
};

// Cancel consultation
exports.cancelConsultation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;
    
    const consultation = await Consultation.findById(id);
    
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }
    
    // Check if user owns this consultation or is admin
    if (consultation.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    // Check if consultation is already cancelled
    if (consultation.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Consultation is already cancelled'
      });
    }
    
    // Check if consultation is in the past
    if (new Date(consultation.startTime) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel past consultations'
      });
    }
    
    // Delete calendar event
    if (consultation.calendarEventId) {
      try {
        await deleteCalendarEvent(consultation.calendarEventId);
      } catch (error) {
        console.error('Error deleting calendar event:', error);
        // Continue even if calendar deletion fails
      }
    }
    
    // Update consultation
    consultation.status = 'cancelled';
    consultation.cancellationReason = reason || 'Cancelled by user';
    
    await consultation.save();
    
    res.status(200).json({
      success: true,
      data: consultation
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to get blackout times
const getBlackoutTimes = async (date) => {
  // This would integrate with your calendar API to get blocked times
  // For now, return an empty array
  return [];
};