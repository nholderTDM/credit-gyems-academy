// debug-auth-roles.js
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function debugAuth() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const User = require('./models/user');
    const Service = require('./models/service');
    
    // Check the admin user
    const adminEmail = 'test_20250602171016_9056@creditgyemstest.com';
    const adminUser = await User.findOne({ email: adminEmail });
    
    if (adminUser) {
      console.log('👤 Admin User Found:');
      console.log(`  Email: ${adminUser.email}`);
      console.log(`  Role: ${adminUser.role}`);
      console.log(`  ID: ${adminUser._id}`);
      
      // Generate a token to test
      const token = jwt.sign(
        { userId: adminUser._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      console.log(`\n🔑 Generated Token:\n${token}`);
      
      // Decode it back to verify
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('\n🔓 Decoded Token:', decoded);
      
      // Update user to admin if not already
      if (adminUser.role !== 'admin') {
        console.log('\n⚠️  User role is not admin! Updating...');
        adminUser.role = 'admin';
        await adminUser.save();
        console.log('✅ User role updated to admin');
      }
    } else {
      console.log('❌ Admin user not found!');
    }
    
    // Check services
    console.log('\n📦 Checking Services:');
    const services = await Service.find({});
    console.log(`Found ${services.length} services`);
    
    // Check all users and their roles
    console.log('\n👥 All Users:');
    const users = await User.find({}).select('email role');
    users.forEach(user => {
      console.log(`  ${user.email}: ${user.role}`);
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugAuth();