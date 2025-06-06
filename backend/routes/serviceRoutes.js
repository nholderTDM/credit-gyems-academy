const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public routes - anyone can view services
router.get('/', serviceController.getServices); // Get all services
router.get('/:id', serviceController.getServiceById); // Get single service

// Protected routes - require authentication
router.use(protect); // Apply authentication to all routes below

// User routes - authenticated users can book services
router.post('/:id/book', serviceController.bookService); // Book a service
router.get('/user/bookings', serviceController.getUserBookings); // Get user's bookings
router.put('/bookings/:bookingId/cancel', serviceController.cancelBooking); // Cancel a booking

// Admin only routes
router.post('/', adminOnly, serviceController.createService); // Create new service
router.put('/:id', adminOnly, serviceController.updateService); // Update service
router.delete('/:id', adminOnly, serviceController.deleteService); // Delete service
router.get('/admin/bookings', adminOnly, serviceController.getAllBookings); // Get all bookings
router.put('/bookings/:bookingId/status', adminOnly, serviceController.updateBookingStatus); // Update booking status

// Admin seed route - useful for initial setup
router.post('/seed', adminOnly, serviceController.seedServices); // Seed initial services

module.exports = router;