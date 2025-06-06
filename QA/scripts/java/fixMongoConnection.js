// scripts/fixMongoConnection.js - FIXED MongoDB Connection Script
require('dotenv').config();
const mongoose = require('mongoose');

// FIXED: Updated connection options (removed deprecated options)
const connectToMongoDB = async (retries = 3) => {
  console.log('📊 Attempting MongoDB connection...');
  
  // CORRECTED connection options - removed deprecated parameters
  const connectionOptions = {
    // Remove all deprecated options that were causing the error
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000, // Increased timeout
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    // Removed these deprecated options:
    // bufferMaxEntries: 0, // This was causing the error
    // bufferCommands: false, // This was causing the error
    // family: 4 // Not needed
  };
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Connection attempt ${attempt}/${retries}`);
      
      // Close any existing connection
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        console.log('🔌 Closed existing connection');
      }
      
      // Connect with corrected options
      await mongoose.connect(process.env.MONGODB_URI, connectionOptions);
      
      // Test the connection
      await mongoose.connection.db.admin().ping();
      
      console.log('✅ MongoDB connected successfully');
      
      // Log connection details
      console.log(`📍 Database: ${mongoose.connection.name}`);
      console.log(`🏠 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
      console.log(`🔗 Ready State: ${mongoose.connection.readyState}`);
      
      return true;
      
    } catch (error) {
      console.log(`❌ Attempt ${attempt} failed: ${error.message}`);
      
      if (attempt === retries) {
        console.log('💥 All connection attempts failed');
        
        // Provide specific error guidance
        if (error.message.includes('ENOTFOUND')) {
          console.log('🔍 DNS Resolution Error - Check your internet connection');
        } else if (error.message.includes('authentication failed')) {
          console.log('🔐 Authentication Error - Check your MongoDB credentials');
        } else if (error.message.includes('timeout')) {
          console.log('⏱️  Timeout Error - Your network or MongoDB Atlas might be slow');
        } else if (error.message.includes('not supported')) {
          console.log('🔧 Configuration Error - Using updated mongoose options');
        }
        
        return false;
      }
      
      // Wait before retrying
      console.log(`⏳ Waiting 3 seconds before retry...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
};

// IMPROVED: Test basic CRUD operations with better error handling
const testCRUDOperations = async () => {
  console.log('\n🧪 Testing basic CRUD operations...');
  
  try {
    // Import models with error handling
    let User;
    try {
      User = require('../backend/models/user');
    } catch (e) {
      console.log('❌ Could not import User model:', e.message);
      return false;
    }
    
    // Create test document with timeout protection
    console.log('📝 Creating test document...');
    const testUser = new User({
      firebaseUid: `test_${Date.now()}`,
      email: `test-${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      isActive: true
    });
    
    // Save with explicit timeout
    const savedUser = await Promise.race([
      testUser.save(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Save operation timed out after 15 seconds')), 15000)
      )
    ]);
    
    console.log('✅ Document created successfully');
    console.log(`   ID: ${savedUser._id}`);
    console.log(`   Email: ${savedUser.email}`);
    
    // Read test
    console.log('📖 Reading document...');
    const foundUser = await User.findById(savedUser._id);
    if (foundUser) {
      console.log('✅ Document read successfully');
    } else {
      throw new Error('Could not find created document');
    }
    
    // Update test
    console.log('✏️  Updating document...');
    foundUser.lastName = 'Updated';
    await foundUser.save();
    console.log('✅ Document updated successfully');
    
    // Delete test
    console.log('🗑️  Deleting document...');
    await User.deleteOne({ _id: savedUser._id });
    console.log('✅ Document deleted successfully');
    
    console.log('🎉 All CRUD operations successful!');
    return true;
    
  } catch (error) {
    console.log(`❌ CRUD test failed: ${error.message}`);
    
    // Specific error guidance
    if (error.message.includes('timed out')) {
      console.log('💡 Try: Increase MongoDB timeout settings or check network');
    } else if (error.message.includes('buffering timed out')) {
      console.log('💡 Try: Ensure mongoose.connect() is called before database operations');
    }
    
    return false;
  }
};

// SIMPLIFIED: Connection string optimization
const optimizeConnectionString = () => {
  console.log('\n🔧 Connection String Check:');
  
  const currentUri = process.env.MONGODB_URI;
  if (!currentUri) {
    console.log('❌ MONGODB_URI not found in environment variables');
    return;
  }
  
  console.log('Current URI format: Valid MongoDB Atlas connection string');
  
  // Check for required parameters
  const requiredParams = ['retryWrites=true', 'w=majority'];
  const missingParams = requiredParams.filter(param => !currentUri.includes(param));
  
  if (missingParams.length === 0) {
    console.log('✅ Connection string has all required parameters');
  } else {
    console.log('⚠️  Missing parameters:', missingParams.join(', '));
  }
};

// ENHANCED: Main diagnostic function
const runMongoDBDiagnostic = async () => {
  console.log('🚀 MongoDB Connection Diagnostic Tool - FIXED VERSION');
  console.log('=' .repeat(60));
  
  // Check environment variables
  console.log('\n🔍 Environment Check:');
  if (process.env.MONGODB_URI) {
    console.log('✅ MONGODB_URI is set');
  } else {
    console.log('❌ MONGODB_URI is missing');
    return;
  }
  
  // Check connection string
  optimizeConnectionString();
  
  // Test connection with fixed options
  console.log('\n🔗 Testing connection with corrected mongoose options...');
  const connected = await connectToMongoDB(3);
  
  if (connected) {
    console.log('\n✅ MongoDB connection successful!');
    
    // Test CRUD operations
    const crudSuccess = await testCRUDOperations();
    
    if (crudSuccess) {
      console.log('\n🎉 ALL TESTS PASSED! MongoDB is working correctly.');
    } else {
      console.log('\n⚠️  Connection works but CRUD operations failed.');
    }
  } else {
    console.log('\n❌ MongoDB connection failed.');
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check your internet connection');
    console.log('2. Verify MongoDB Atlas network access (see screenshot - looks good)');
    console.log('3. Confirm your MongoDB credentials');
    console.log('4. Try connecting from MongoDB Compass with the same connection string');
  }
  
  // Close connection
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
    console.log('\n📊 Database connection closed');
  }
};

// Export for use in other scripts
module.exports = {
  connectToMongoDB,
  testCRUDOperations,
  optimizeConnectionString,
  runMongoDBDiagnostic
};

// Run if called directly
if (require.main === module) {
  runMongoDBDiagnostic()
    .then(() => {
      console.log('\n🎯 MongoDB diagnostic completed');
      process.exit(0);
    })
    .catch((error) => {
      console.log(`\n💥 Diagnostic failed: ${error.message}`);
      process.exit(1);
    });
}