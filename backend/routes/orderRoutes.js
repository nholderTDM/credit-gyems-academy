const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Stripe webhook (must be raw body)
router.post('/webhook', express.raw({ type: 'application/json' }), orderController.handleWebhook);

// Protected routes
router.post('/payment-intent', protect, orderController.createPaymentIntent);
router.get('/', protect, orderController.getUserOrders);
router.get('/:id', protect, orderController.getOrderById);

// Admin routes
router.get('/admin/all', protect, adminOnly, orderController.getAllOrders);

module.exports = router;