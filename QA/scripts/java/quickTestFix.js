// scripts/quickTestFix.js - Simple test for your current setup
require('dotenv').config();
const mongoose = require('mongoose');

// Test if we can find your ebookService
const testEbookServiceImport = () => {
  console.log('🔍 Testing ebookService import...');
  
  const possiblePaths = [
    './backend/services/ebookService',
    '../backend/services/ebookService', 
    './services/ebookService',
    '../services/ebookService'
  ];
  
  for (const servicePath of possiblePaths) {
    try {
      const service = require(servicePath);
      console.log(`✅ Found ebookService at: ${servicePath}`);
      
      // Test if key functions exist
      const requiredFunctions = [
        'initializeFirebase',
        'uploadEbookFile',
        'createSecureEbookDownload',
        'processEbookDownload'
      ];
      
      console.log('📋 Checking required functions:');
      for (const funcName of requiredFunctions) {
        if (typeof service[funcName] === 'function') {
          console.log(`  ✅ ${funcName}: Found`);
        } else {
          console.log(`  ❌ ${funcName}: Missing`);
        }
      }
      
      return service;
    } catch (e) {
      console.log(`  ❌ ${servicePath}: ${e.message}`);
    }
  }
  
  return null;
};

// Test models import
const testModelsImport = () => {
  console.log('\n🔍 Testing models import...');
  
  const models = ['user', 'product', 'order'];
  const possibleBasePaths = [
    './backend/models/',
    '../backend/models/',
    './models/',
    '../models/'
  ];
  
  const foundModels = {};
  
  for (const modelName of models) {
    for (const basePath of possibleBasePaths) {
      try {
        const modelPath = `${basePath}${modelName}`;
        const model = require(modelPath);
        console.log(`✅ Found ${modelName} at: ${modelPath}`);
        foundModels[modelName] = model;
        break;
      } catch (e) {
        // Try next path
      }
    }
    
    if (!foundModels[modelName]) {
      console.log(`❌ Could not find ${modelName} model`);
    }
  }
  
  return foundModels;
};

// Simple Firebase test
const testFirebase = async () => {
  console.log('\n🔥 Testing Firebase connection...');
  
  try {
    // Check environment variables
    const requiredVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_STORAGE_BUCKET'];
    for (const varName of requiredVars) {
      if (process.env[varName]) {
        console.log(`✅ ${varName}: Set`);
      } else {
        console.log(`❌ ${varName}: Missing`);
        return false;
      }
    }
    
    // Try to initialize Firebase Admin
    const admin = require('firebase-admin');
    
    // Check if already initialized
    if (admin.apps.length === 0) {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    }
    
    const bucket = admin.storage().bucket();
    await bucket.getMetadata();
    
    console.log('✅ Firebase connection successful');
    return true;
    
  } catch (error) {
    console.log(`❌ Firebase connection failed: ${error.message}`);
    
    if (error.message.includes('application-default')) {
      console.log('💡 Try running: gcloud auth application-default login');
    }
    
    return false;
  }
};

// Simple MongoDB test
const testMongoDB = async () => {
  console.log('\n📊 Testing MongoDB connection...');
  
  try {
    if (!process.env.MONGODB_URI) {
      console.log('❌ MONGODB_URI not set in environment');
      return false;
    }
    
    console.log(`🔗 Connecting to: ${process.env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);
    
    await mongoose.connect(process.env.MONGODB_URI);
    await mongoose.connection.db.admin().ping();
    
    console.log('✅ MongoDB connection successful');
    return true;
    
  } catch (error) {
    console.log(`❌ MongoDB connection failed: ${error.message}`);
    return false;
  }
};

// Simple product test
const testBasicProductFlow = async (ebookService, models) => {
  console.log('\n📦 Testing basic product flow...');
  
  try {
    const { User, Product, Order } = models;
    
    if (!User || !Product || !Order) {
      console.log('❌ Missing required models for testing');
      return false;
    }
    
    // Create test user
    console.log('👤 Creating test user...');
    const testUser = new User({
      firebaseUid: `test_${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      isActive: true
    });
    
    await testUser.save();
    console.log(`✅ Test user created: ${testUser.email}`);
    
    // Create test product (without PDF for now)
    console.log('📚 Creating test product...');
    const testProduct = new Product({
      title: 'Simple Test Product',
      slug: `simple-test-product-${Date.now()}`,
      description: 'A simple test product for validation',
      type: 'ebook',
      price: 29.99,
      status: 'published'
    });
    
    await testProduct.save();
    console.log(`✅ Test product created: ${testProduct.title}`);
    
    // Test Firebase upload (simplified)
    if (ebookService && ebookService.uploadEbookFile) {
      console.log('📤 Testing file upload...');
      
      // Create a simple test PDF buffer
      const testPdfContent = '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\ntrailer<</Size 3/Root 1 0 R>>startxref\n0\n%%EOF';
      
      const mockFile = {
        buffer: Buffer.from(testPdfContent),
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: testPdfContent.length
      };
      
      try {
        const uploadResult = await ebookService.uploadEbookFile(mockFile, testProduct._id);
        console.log(`✅ File upload successful: ${uploadResult.filePath}`);
        
        // Update product with file path
        testProduct.pdfFile = uploadResult.filePath;
        testProduct.filePath = uploadResult.filePath;
        await testProduct.save();
        
      } catch (uploadError) {
        console.log(`⚠️  File upload test failed: ${uploadError.message}`);
      }
    }
    
    // Clean up test data
    console.log('🧹 Cleaning up test data...');
    await User.deleteOne({ _id: testUser._id });
    await Product.deleteOne({ _id: testProduct._id });
    
    console.log('✅ Basic product flow test completed');
    return true;
    
  } catch (error) {
    console.log(`❌ Basic product flow test failed: ${error.message}`);
    return false;
  }
};

// Main test function
const runQuickTest = async () => {
  console.log('🚀 Credit Gyems Academy - Quick Setup Test');
  console.log('==========================================\n');
  
  let testsPassedCount = 0;
  let totalTests = 5;
  
  try {
    // Test 1: ebookService import
    const ebookService = testEbookServiceImport();
    if (ebookService) testsPassedCount++;
    
    // Test 2: Models import  
    const models = testModelsImport();
    if (Object.keys(models).length >= 3) testsPassedCount++;
    
    // Test 3: MongoDB connection
    if (await testMongoDB()) testsPassedCount++;
    
    // Test 4: Firebase connection
    if (await testFirebase()) testsPassedCount++;
    
    // Test 5: Basic product flow
    if (await testBasicProductFlow(ebookService, models)) testsPassedCount++;
    
    // Results
    console.log('\n🎉 QUICK TEST RESULTS');
    console.log('====================');
    console.log(`✅ Tests Passed: ${testsPassedCount}/${totalTests}`);
    
    if (testsPassedCount === totalTests) {
      console.log('\n🎉 All tests passed! Your setup looks good.');
      console.log('You can now run the full test suite:');
      console.log('   npm run test:products');
    } else {
      console.log(`\n⚠️  ${totalTests - testsPassedCount} test(s) failed. See details above.`);
      console.log('Fix the issues and try again.');
    }
    
  } catch (error) {
    console.log(`\n💥 Test failed: ${error.message}`);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n📊 Database connection closed');
    }
  }
};

// Run the test
if (require.main === module) {
  runQuickTest()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runQuickTest };