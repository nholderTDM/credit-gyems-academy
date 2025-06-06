// test-services.js
const mongoose = require('mongoose');
require('dotenv').config();

async function testServices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const Service = require('./models/service');
    
    // Seed services
    await Service.seedServices();
    
    // Get all services
    const services = await Service.find({});
    console.log(`\n✅ Found ${services.length} services:`);
    services.forEach(s => {
      console.log(`  - ${s.displayName} (${s.serviceType}): $${s.price.amount}`);
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testServices();