// test-auth-middleware.js
const axios = require('axios');
require('dotenv').config();

const API_BASE = 'http://localhost:5000/api';

async function testAuth() {
  try {
    console.log('🔐 Testing Authentication Flow...\n');
    
    // 1. Login as admin
    const adminEmail = 'test_20250602171016_9056@creditgyemstest.com';
    console.log(`1. Logging in as admin: ${adminEmail}`);
    
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: adminEmail,
      password: 'TestPass123!'
    });
    
    const { token, user } = loginResponse.data;
    console.log(`✅ Login successful!`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   User Role: ${user.role}`);
    console.log(`   Token: ${token.substring(0, 50)}...`);
    
    // 2. Test profile endpoint
    console.log('\n2. Testing /auth/profile endpoint...');
    try {
      const profileResponse = await axios.get(`${API_BASE}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Profile endpoint works!`);
      console.log(`   Role from profile: ${profileResponse.data.role}`);
    } catch (error) {
      console.log(`❌ Profile endpoint failed: ${error.response?.data?.message}`);
    }
    
    // 3. Test public services endpoint
    console.log('\n3. Testing public /services endpoint...');
    try {
      const servicesResponse = await axios.get(`${API_BASE}/services`);
      console.log(`✅ Public services endpoint works!`);
      console.log(`   Services found: ${servicesResponse.data.count}`);
    } catch (error) {
      console.log(`❌ Services endpoint failed: ${error.response?.data?.message}`);
    }
    
    // 4. Test admin endpoint
    console.log('\n4. Testing admin /services/seed endpoint...');
    try {
      const seedResponse = await axios.post(`${API_BASE}/services/seed`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Admin endpoint works!`);
      console.log(`   Message: ${seedResponse.data.message}`);
    } catch (error) {
      console.log(`❌ Admin endpoint failed: ${error.response?.data?.message}`);
    }
    
    // 5. Test creating a service
    console.log('\n5. Testing service creation...');
    try {
      const createResponse = await axios.post(`${API_BASE}/services`, {
        serviceType: 'test_service',
        title: 'Test Service',
        displayName: 'Test Service Display',
        description: 'Test service description',
        shortDescription: 'Test short description',
        price: { amount: 99.99 }
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`✅ Service creation works!`);
      console.log(`   Service ID: ${createResponse.data.data._id}`);
    } catch (error) {
      console.log(`❌ Service creation failed: ${error.response?.data?.message}`);
      if (error.response?.data?.errors) {
        console.log(`   Errors:`, error.response.data.errors);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Also test the authMiddleware directly
async function testMiddleware() {
  console.log('\n\n🔧 Testing Auth Middleware Directly...\n');
  
  try {
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGODB_URI);
    
    const User = require('./models/user');
    const { protect, adminOnly } = require('./middleware/authMiddleware');
    const jwt = require('jsonwebtoken');
    
    // Get admin user
    const adminUser = await User.findOne({ email: 'test_20250602171016_9056@creditgyemstest.com' });
    console.log('Admin user role in DB:', adminUser?.role);
    
    // Create mock request/response
    const token = jwt.sign({ userId: adminUser._id }, process.env.JWT_SECRET);
    
    const mockReq = {
      headers: {
        authorization: `Bearer ${token}`
      }
    };
    
    const mockRes = {
      status: (code) => ({
        json: (data) => console.log(`Response ${code}:`, data)
      })
    };
    
    const mockNext = () => console.log('✅ Middleware passed!');
    
    // Test protect middleware
    console.log('\nTesting protect middleware...');
    await protect(mockReq, mockRes, mockNext);
    
    if (mockReq.user) {
      console.log('User attached to request:', {
        id: mockReq.user._id,
        email: mockReq.user.email,
        role: mockReq.user.role
      });
      
      // Test adminOnly middleware
      console.log('\nTesting adminOnly middleware...');
      adminOnly(mockReq, mockRes, mockNext);
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Middleware test error:', error);
  }
}

// Run both tests
testAuth().then(() => testMiddleware());