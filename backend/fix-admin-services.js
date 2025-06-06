// fix-admin-services.js
const mongoose = require('mongoose');
require('dotenv').config();

async function fixAdminAndServices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const User = require('./models/user');
    const Service = require('./models/service');
    
    // 1. Fix admin user role
    console.log('1. Fixing admin user role...');
    const adminEmail = 'test_20250602171016_9056@creditgyemstest.com';
    const adminUser = await User.findOne({ email: adminEmail });
    
    if (adminUser) {
      console.log(`   Current role: ${adminUser.role}`);
      if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        await adminUser.save();
        console.log('   ✅ Updated to admin role');
      } else {
        console.log('   ✅ Already has admin role');
      }
    } else {
      console.log('   ❌ Admin user not found!');
    }
    
    // 2. Check/seed services
    console.log('\n2. Checking services...');
    let services = await Service.find({});
    console.log(`   Found ${services.length} services`);
    
    if (services.length === 0) {
      console.log('   Seeding services...');
      await Service.seedServices();
      services = await Service.find({});
      console.log(`   ✅ Seeded ${services.length} services`);
    }
    
    // 3. List all services
    console.log('\n3. Current services:');
    services.forEach(service => {
      console.log(`   - ${service.displayName} (${service.serviceType}): $${service.price.amount}`);
    });
    
    // 4. Check all users and roles
    console.log('\n4. All users and roles:');
    const users = await User.find({}).select('email role');
    users.forEach(user => {
      console.log(`   ${user.email}: ${user.role}`);
    });
    
    // 5. Generate a fresh admin token for testing
    const jwt = require('jsonwebtoken');
    if (adminUser) {
      const token = jwt.sign(
        { userId: adminUser._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      console.log('\n5. Fresh admin token for testing:');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: TestPass123!`);
      console.log(`   Token: ${token}`);
      console.log('\n   PowerShell test command:');
      console.log(`   $token = "${token}"`);
      console.log(`   Invoke-RestMethod -Method GET -Uri "http://localhost:5000/api/services" -Headers @{"Authorization"="Bearer $token"}`);
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Fix complete!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixAdminAndServices();