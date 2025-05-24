const express = require('express');
const router = express.Router();

// Only import routes that exist
const leadRoutes = require('./leadRoutes');

// Comment out routes that don't exist yet
// const authRoutes = require('./authRoutes');
// const productRoutes = require('./productRoutes');
// const orderRoutes = require('./orderRoutes');
// const bookingRoutes = require('./bookingRoutes');
// const uploadRoutes = require('./uploadRoutes');

// Mount only the routes that exist
router.use('/leads', leadRoutes);

// Comment out until you create the missing files
// router.use('/auth', authRoutes);
// router.use('/products', productRoutes);
// router.use('/orders', orderRoutes);
// router.use('/bookings', bookingRoutes);
// router.use('/upload', uploadRoutes);

// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'ok', 
      message: 'Credit Gyems Academy API is running',
      timestamp: new Date().toISOString()
    });
});
  
// API info route
router.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Welcome to Credit Gyems Academy API',
      version: '1.0.0',
      endpoints: {
        leads: '/api/leads',
        health: '/api/health'
      }
    });
});
  
module.exports = router;