const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const serviceRoutes = require('./serviceRoutes');
const bookingRoutes = require('./bookingRoutes');
const orderRoutes = require('./orderRoutes');
const communityRoutes = require('./communityRoutes');
const leadRoutes = require('./leadRoutes');
const contactRoutes = require('./contactRoutes');
const cartRoutes = require('./cartRoutes');

// Register all routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/services', serviceRoutes);
router.use('/bookings', bookingRoutes);
router.use('/orders', orderRoutes);
router.use('/community', communityRoutes);
router.use('/leads', leadRoutes);
router.use('/contact', contactRoutes);
router.use('/cart', cartRoutes);

// Debug: Show registered routes
console.log('📍 Routes registered:');
console.log('  - /api/auth');
console.log('  - /api/products');
console.log('  - /api/services');
console.log('  - /api/bookings');
console.log('  - /api/orders');
console.log('  - /api/community');
console.log('  - /api/leads');
console.log('  - /api/contact');
console.log('  - /api/cart');

module.exports = router;
