// verify-services.js
const mongoose = require('mongoose');
require('dotenv').config();

async function verify() {
  try {
    // Test route loading
    console.log('Testing route files...');
    const serviceRoutes = require('./routes/serviceRoutes');
    console.log('✅ Service routes loaded');
    
    const serviceController = require('./controllers/serviceController');
    console.log('✅ Service controller loaded');
    
    // Test models
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const Service = require('./models/service');
    const Booking = require('./models/booking');
    console.log('✅ Models loaded');
    
    // Test creating a service
    const testService = new Service({
      name: 'Test Service',
      description: 'Test description',
      category: 'consultation',
      price: 99.99,
      duration: 60,
      createdBy: new mongoose.Types.ObjectId()
    });
    
    const validation = testService.validateSync();
    if (!validation) {
      console.log('✅ Service model validation passed');
    } else {
      console.log('❌ Service model validation failed:', validation.errors);
    }
    
    await mongoose.disconnect();
    console.log('\n✅ All verifications passed!');
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verify();