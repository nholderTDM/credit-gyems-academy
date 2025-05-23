const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public routes
router.get('/available-slots', bookingController.getAvailableTimeSlots);

// Protected routes
router.post('/', protect, bookingController.createBooking);
router.get('/', protect, bookingController.getUserBookings);
router.get('/:id', protect, bookingController.getBookingById);
router.get('/:id/calendar', protect, bookingController.getBookingCalendarEvents);
router.put('/:id/cancel', protect, bookingController.cancelBooking);
router.put('/:id/reschedule', protect, bookingController.rescheduleBooking);

// Admin routes
router.get('/admin/all', protect, adminOnly, bookingController.getAllBookings);
router.put('/admin/:id/status', protect, adminOnly, bookingController.updateBookingStatus);

module.exports = router;