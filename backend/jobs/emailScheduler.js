const cron = require('node-cron');
const Booking = require('../models/booking');
const emailService = require('../services/emailService');

// Initialize email scheduler
const initializeEmailScheduler = () => {
  // Run every hour to check for bookings that need reminders
  cron.schedule('0 * * * *', async () => {
    console.log('Running booking reminder check...');
    
    try {
      // Get bookings that are 24 hours away and haven't had reminders sent
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Find bookings within a 1-hour window of 24 hours before start time
      const startOfWindow = new Date(tomorrow);
      startOfWindow.setHours(tomorrow.getHours() - 1);
      
      const endOfWindow = new Date(tomorrow);
      endOfWindow.setHours(tomorrow.getHours() + 1);
      
      const bookings = await Booking.find({
        startTime: { $gte: startOfWindow, $lt: endOfWindow },
        status: 'scheduled',
        reminderSent: false
      });
      
      console.log(`Found ${bookings.length} bookings that need reminders`);
      
      // Send reminders for each booking
      for (const booking of bookings) {
        await emailService.sendBookingReminder(booking._id);
        console.log(`Sent reminder for booking ${booking._id}`);
      }
    } catch (error) {
      console.error('Error running booking reminder check:', error);
    }
  });
  
  console.log('Email scheduler initialized');
};

module.exports = { initializeEmailScheduler };