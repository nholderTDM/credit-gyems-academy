const express = require('express');
const router = express.Router();

console.log('📍 Loading routes systematically...');

// Health check route (always works)
router.get('/health', (req, res) => {
    console.log('✅ Health check accessed');
    res.status(200).json({ 
      status: 'ok', 
      message: 'Credit Gyems Academy API is running',
      timestamp: new Date().toISOString()
    });
});

// API info route
router.get('/', (req, res) => {
    console.log('✅ Root API route accessed');
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

// Load leadRoutes (should work)
try {
    console.log('📍 Attempting to load leadRoutes...');
    const leadRoutes = require('./leadRoutes');
    router.use('/leads', leadRoutes);
    console.log('✅ leadRoutes loaded successfully');
} catch (error) {
    console.error('❌ Error loading leadRoutes:', error.message);
}

// Uncomment ONE BY ONE to test each route file after leadRoutes works:

// STEP 1: Test authRoutes first (after fixing the import)
/*
try {
    console.log('📍 Attempting to load authRoutes...');
    const authRoutes = require('./authRoutes');
    router.use('/auth', authRoutes);
    console.log('✅ authRoutes loaded successfully');
} catch (error) {
    console.error('❌ Error loading authRoutes:', error.message);
}
*/

// STEP 2: Test productRoutes
/*
try {
    console.log('📍 Attempting to load productRoutes...');
    const productRoutes = require('./productRoutes');
    router.use('/products', productRoutes);
    console.log('✅ productRoutes loaded successfully');
} catch (error) {
    console.error('❌ Error loading productRoutes:', error.message);
}
*/

// STEP 3: Test orderRoutes
/*
try {
    console.log('📍 Attempting to load orderRoutes...');
    const orderRoutes = require('./orderRoutes');
    router.use('/orders', orderRoutes);
    console.log('✅ orderRoutes loaded successfully');
} catch (error) {
    console.error('❌ Error loading orderRoutes:', error.message);
}
*/

// STEP 4: Test bookingRoutes
/*
try {
    console.log('📍 Attempting to load bookingRoutes...');
    const bookingRoutes = require('./bookingRoutes');
    router.use('/bookings', bookingRoutes);
    console.log('✅ bookingRoutes loaded successfully');
} catch (error) {
    console.error('❌ Error loading bookingRoutes:', error.message);
}
*/

// STEP 5: Test uploadRoutes
/*
try {
    console.log('📍 Attempting to load uploadRoutes...');
    const uploadRoutes = require('./uploadRoutes');
    router.use('/uploads', uploadRoutes);
    console.log('✅ uploadRoutes loaded successfully');
} catch (error) {
    console.error('❌ Error loading uploadRoutes:', error.message);
}
*/

console.log('📍 Routes setup complete');

module.exports = router;