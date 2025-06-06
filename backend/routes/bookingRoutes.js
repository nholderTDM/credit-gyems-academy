const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// DEBUG: Check which methods exist
console.log('🔍 Checking bookingController methods:');
const methods = [
  'getAvailableTimeSlots',
  'createBooking',
  'getUserBookings',
  'getBookingById',
  'getBookingCalendarEvents',
  'cancelBooking',
  'rescheduleBooking',
  'getAllBookings',
  'updateBookingStatus',
  'getBlackoutDates'
];

methods.forEach(method => {
  console.log(`  ${method}: ${bookingController[method] ? '✅ exists' : '❌ MISSING'}`);
});

// Debug - remove this after fixing
console.log('🔍 Available bookingController methods:', Object.keys(bookingController));

// Public routes
router.get('/available-slots', bookingController.getAvailableTimeSlots);

// Protected routes - SPECIFIC routes must come BEFORE :id routes
router.post('/', protect, bookingController.createBooking);
router.get('/my-bookings', protect, bookingController.getUserBookings);  // This was missing!
router.get('/blackout-dates', protect, bookingController.getBlackoutDates);  // This was missing!

// Admin routes (specific paths before :id)
router.get('/admin/all', protect, adminOnly, bookingController.getAllBookings);

// Routes with :id parameter (MUST come LAST)
router.get('/:id', protect, bookingController.getBookingById);
router.get('/:id/calendar', protect, bookingController.getBookingCalendarEvents);
router.put('/:id/cancel', protect, bookingController.cancelBooking);
router.put('/:id/reschedule', protect, bookingController.rescheduleBooking);
router.put('/admin/:id/status', protect, adminOnly, bookingController.updateBookingStatus);

module.exports = router;