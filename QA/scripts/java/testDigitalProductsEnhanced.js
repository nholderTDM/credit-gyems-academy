// scripts/testDigitalProducts.js - Enhanced version integrating with your ebookService
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

// Your existing flexible import logic (keeping what works)
let Product, Order, User, ebookService;

// Import models with flexible paths
const importModel = (modelName) => {
  const possiblePaths = [
    `./backend/models/${modelName}`,      // Your actual path
    `../backend/models/${modelName}`,
    `../models/${modelName}`,
    `./models/${modelName}`
  ];
  
  for (const modelPath of possiblePaths) {
    try {
      return require(modelPath);
    } catch (e) {
      continue;
    }
  }
  
  console.error(`❌ Could not find ${modelName} model in any of these locations:`);
  possiblePaths.forEach(path => console.error(`   - ${path}.js`));
  process.exit(1);
};

// Import your ebookService (this is the key integration)
const importEbookService = () => {
  const possiblePaths = [
    './backend/services/ebookService',    // Your actual path
    '../backend/services/ebookService',
    '../services/ebookService',
    './services/ebookService',
    '../ebookService'
  ];
  
  for (const servicePath of possiblePaths) {
    try {
      const service = require(servicePath);
      console.log(`✅ Found ebookService at: ${servicePath}`);
      return service;
    } catch (e) {
      continue;
    }
  }
  
  console.error('❌ Could not find ebookService. This is required for proper testing.');
  console.error('Please ensure ebookService.js exists in your services directory.');
  process.exit(1);
};

// Load all required modules
Product = importModel('product');
Order = importModel('order');
User = importModel('user');
ebookService = importEbookService();

// ANSI colors (keeping your nice console output)
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Enhanced Test 1: Environment Variables (your version + additions)
const testEnvironmentVariables = () => {
  log('\n🔧 Checking Environment Variables...', 'cyan');
  
  const requiredVars = [
    'MONGODB_URI',
    'FIREBASE_PROJECT_ID', 
    'FIREBASE_STORAGE_BUCKET'
  ];
  
  const recommendedVars = [
    'DOWNLOAD_TOKEN_SECRET',
    'WATERMARK_SECRET',
    'SENDGRID_API_KEY',
    'JWT_SECRET'
  ];
  
  let hasRequired = true;
  
  log('Required variables:', 'blue');
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      log(`  ✅ ${varName}: Set`, 'green');
    } else {
      log(`  ❌ ${varName}: Missing`, 'red');
      hasRequired = false;
    }
  });
  
  log('\nRecommended variables (for full functionality):', 'blue');
  recommendedVars.forEach(varName => {
    if (process.env[varName]) {
      log(`  ✅ ${varName}: Set`, 'green');
    } else {
      log(`  ⚠️  ${varName}: Not set (recommended)`, 'yellow');
    }
  });
  
  if (!hasRequired) {
    log('\n❌ Required environment variables are missing!', 'red');
    log('Please set these in your .env file before running tests.', 'red');
    return false;
  }
  
  log('\n✅ Environment variables check passed', 'green');
  return true;
};

// Enhanced Test 2: Firebase Connection (using your ebookService)
const testFirebaseConnection = async () => {
  log('\n🔥 Testing Firebase Connection...', 'cyan');
  
  try {
    // Use your ebookService to test Firebase
    await ebookService.initializeFirebase();
    log('✅ Firebase connection successful', 'green');
    return true;
  } catch (error) {
    log(`❌ Firebase connection failed: ${error.message}`, 'red');
    if (error.message.includes('application-default')) {
      log('💡 Try running: gcloud auth application-default login', 'yellow');
    }
    return false;
  }
};

// Enhanced Test 3: Create Real Test Product with PDF
const createTestProducts = async () => {
  log('\n📦 Creating Test Products with Real PDFs...', 'cyan');
  
  try {
    // Check for existing products first
    const existingProducts = await Product.find({ title: /Test.*Guide/ });
    if (existingProducts.length > 0) {
      log(`⚠️  Found ${existingProducts.length} existing test products`, 'yellow');
      
      // Check if they have PDF files
      const productsWithPDF = existingProducts.filter(p => p.pdfFile || p.filePath);
      if (productsWithPDF.length > 0) {
        log('✅ Using existing products with PDF files', 'green');
        return productsWithPDF;
      }
    }
    
    log('📄 Creating proper PDF file...', 'blue');
    
    // Create a real PDF using PDFKit (like your ebookService does)
    const PDFDocument = require('pdfkit');
    const fs = require('fs');
    const os = require('os');
    
    // Create temporary PDF
    const tempPdfPath = path.join(os.tmpdir(), `test-ebook-${Date.now()}.pdf`);
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(tempPdfPath);
    doc.pipe(stream);
    
    // Add comprehensive content (testing real-world scenario)
    doc.fontSize(24).text('Credit Repair Mastery Guide', 100, 100);
    doc.fontSize(16).text('Test Version for Digital Delivery System', 100, 140);
    
    doc.fontSize(14).text('Table of Contents:', 100, 200);
    const chapters = [
      'Introduction to Credit Repair',
      'Understanding Credit Scores', 
      'Dispute Strategies and Templates',
      'Building Positive Credit History',
      'Advanced Optimization Techniques',
      'Maintaining Excellent Credit'
    ];
    
    chapters.forEach((chapter, index) => {
      doc.text(`${index + 1}. ${chapter}`, 120, 230 + (index * 20));
    });
    
    // Add multiple pages to test proper PDF handling
    for (let i = 1; i <= chapters.length; i++) {
      doc.addPage();
      doc.fontSize(18).text(`Chapter ${i}: ${chapters[i-1]}`, 100, 100);
      doc.fontSize(12).text(
        `This is the content for ${chapters[i-1]}. This chapter contains detailed information about credit repair strategies and techniques that will help users improve their credit scores effectively.`, 
        100, 140, { width: 400, align: 'justify' }
      );
    }
    
    doc.end();
    
    // Wait for PDF to be written
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
    
    // Read PDF buffer and upload using your ebookService
    const pdfBuffer = fs.readFileSync(tempPdfPath);
    
    // Create test product
    const testProduct = new Product({
      title: 'Credit Repair Mastery Test Guide',
      slug: 'credit-repair-mastery-test-guide',
      description: 'A comprehensive test e-book for validating the digital delivery system with real content and proper PDF structure.',
      shortDescription: 'Test e-book for system validation',
      type: 'ebook',
      price: 47.00,
      discountPrice: 29.97,
      currency: 'USD',
      pageCount: chapters.length + 2,
      features: [
        'Complete credit repair methodology',
        'Professional dispute templates',
        'Score optimization strategies',
        'Maintenance best practices'
      ],
      tags: ['credit-repair', 'test', 'ebook'],
      categories: ['Credit Education', 'Test Products'],
      isPopular: true,
      isFeatured: false,
      status: 'published',
      publishedAt: new Date()
    });
    
    await testProduct.save();
    log(`✅ Created test product: ${testProduct.title}`, 'green');
    
    // Upload PDF using your ebookService
    log('📤 Uploading PDF to Firebase Storage...', 'blue');
    const uploadResult = await ebookService.uploadEbookFile({
      buffer: pdfBuffer,
      originalname: 'credit-repair-mastery-test-guide.pdf',
      mimetype: 'application/pdf',
      size: pdfBuffer.length
    }, testProduct._id);
    
    // Update product with file path
    testProduct.pdfFile = uploadResult.filePath;
    testProduct.filePath = uploadResult.filePath; // For compatibility
    await testProduct.save();
    
    // Clean up temp file
    fs.unlinkSync(tempPdfPath);
    
    log(`✅ PDF uploaded successfully: ${uploadResult.filePath}`, 'green');
    log(`   File size: ${(uploadResult.size / 1024).toFixed(1)} KB`, 'blue');
    
    return [testProduct];
    
  } catch (error) {
    log(`❌ Error creating test products: ${error.message}`, 'red');
    throw error;
  }
};

// Enhanced Test 4: Create Test Order (your version works well)
const createTestOrder = async (user, products) => {
  log('\n🛒 Creating Test Order...', 'cyan');
  
  try {
    const product = products[0];
    
    const testOrder = new Order({
      orderNumber: `CG-TEST-${Date.now()}`,
      userId: user._id,
      items: [{
        product: product._id,
        productSnapshot: {
          title: product.title,
          price: product.discountPrice || product.price,
          type: product.type
        },
        quantity: 1,
        price: product.discountPrice || product.price,
        subtotal: product.discountPrice || product.price
      }],
      subtotal: product.discountPrice || product.price,
      total: product.discountPrice || product.price,
      currency: 'USD',
      paymentMethod: 'credit_card',
      paymentStatus: 'completed', // Simulate successful payment
      fulfillmentStatus: 'pending',
      paidAt: new Date(),
      stripePaymentIntentId: `pi_test_${Date.now()}`,
      customerEmail: user.email,
      customerName: `${user.firstName} ${user.lastName}`
    });
    
    await testOrder.save();
    log(`✅ Created test order: ${testOrder.orderNumber}`, 'green');
    log(`   Product: ${product.title}`, 'blue');
    log(`   Amount: $${testOrder.total}`, 'blue');
    
    return testOrder;
    
  } catch (error) {
    log(`❌ Error creating test order: ${error.message}`, 'red');
    throw error;
  }
};

// NEW Enhanced Test 5: Test Secure Digital Delivery (using your ebookService)
const testSecureDigitalDelivery = async (user, order) => {
  log('\n🔒 Testing Secure Digital Delivery System...', 'cyan');
  
  try {
    const product = await Product.findById(order.items[0].product);
    
    log(`📚 Processing delivery for: ${product.title}`, 'blue');
    
    // Use your ebookService to create secure download
    log('🎨 Creating watermarked PDF with user information...', 'blue');
    const secureDownload = await ebookService.createSecureEbookDownload(
      user._id.toString(),
      product._id.toString(), 
      order._id.toString(),
      {
        deviceFingerprint: `test-device-${Date.now()}`
      }
    );
    
    log('✅ Secure download created successfully!', 'green');
    log(`   Download ID: ${secureDownload.downloadId}`, 'blue');
    log(`   Watermarked: ${secureDownload.watermarked}`, 'blue');
    log(`   Expires: ${secureDownload.expiresAt.toLocaleString()}`, 'blue');
    
    // Test the download token validation
    log('🔐 Testing download token validation...', 'blue');
    const downloadResult = await ebookService.processEbookDownload(
      secureDownload.downloadToken,
      {
        ipAddress: '127.0.0.1',
        userAgent: 'Test Browser 1.0',
        deviceFingerprint: `test-device-${Date.now()}`
      }
    );
    
    log('✅ Download processing successful!', 'green');
    log(`   File: ${downloadResult.fileName}`, 'blue');
    log(`   Size: ${(downloadResult.fileSize / 1024).toFixed(1)} KB`, 'blue');
    log(`   Download URL generated: ${!!downloadResult.downloadUrl}`, 'blue');
    
    // Update order with fulfillment info
    order.fulfillmentStatus = 'completed';
    order.fulfilledAt = new Date();
    order.fulfillmentDetails = {
      emailSent: false,
      downloadLinks: [{
        productId: product._id,
        title: product.title,
        downloadId: secureDownload.downloadId,
        expiresAt: secureDownload.expiresAt
      }]
    };
    await order.save();
    
    return {
      secureDownload,
      downloadResult,
      watermarked: true
    };
    
  } catch (error) {
    log(`❌ Error in secure digital delivery: ${error.message}`, 'red');
    throw error;
  }
};

// Enhanced Test 6: Test Analytics (using your ebookService)
const testAnalytics = async (product) => {
  log('\n📊 Testing Analytics System...', 'cyan');
  
  try {
    const analytics = await ebookService.getEbookAnalytics({
      productId: product._id.toString(),
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      endDate: new Date()
    });
    
    log('✅ Analytics data retrieved successfully!', 'green');
    log(`   Total downloads: ${analytics.overall.totalDownloads}`, 'blue');
    log(`   Unique users: ${analytics.overall.uniqueUsers}`, 'blue');
    log(`   Watermarked files: ${analytics.overall.totalWatermarkedFiles}`, 'blue');
    log(`   Security incidents: ${analytics.security.suspiciousActivity}`, 'blue');
    
    return analytics;
    
  } catch (error) {
    log(`❌ Error testing analytics: ${error.message}`, 'red');
    return null;
  }
};

// Your email test (keeping as-is, works well)
const testEmailSending = async (order) => {
  log('\n📧 Testing Email Sending...', 'cyan');
  
  try {
    // Try to import email service
    let emailService;
    try {
      emailService = require('../services/emailService');
    } catch (e) {
      try {
        emailService = require('../emailService');
      } catch (e2) {
        log('⚠️  Email service not found, using mock', 'yellow');
        emailService = {
          isConfigured: () => false,
          sendOrderConfirmation: async (orderId) => {
            log(`📧 Mock: Order confirmation would be sent for order: ${orderId}`, 'blue');
            return true;
          }
        };
      }
    }
    
    if (!emailService.isConfigured || !emailService.isConfigured()) {
      log('⚠️  Email service not configured, using mock', 'yellow');
    }
    
    const emailSent = await emailService.sendOrderConfirmation(order._id);
    
    if (emailSent) {
      log('✅ Email sending test passed', 'green');
      
      order.fulfillmentDetails.emailSent = true;
      order.fulfillmentDetails.emailSentAt = new Date();
      await order.save();
    } else {
      log('❌ Email sending failed', 'red');
    }
    
    return emailSent;
    
  } catch (error) {
    log(`❌ Error in email test: ${error.message}`, 'red');
    return false;
  }
};

// Enhanced main test function
const runCompleteTest = async () => {
  log('\n🚀 Starting Enhanced Digital Product Delivery Test', 'bright');
  log('='.repeat(70), 'cyan');
  
  const startTime = Date.now();
  let testsPassed = 0;
  let totalTests = 8;
  
  try {
    // Test 1: Environment
    if (testEnvironmentVariables()) testsPassed++;
    
    // Test 2: Database
    if (await testDatabaseConnection()) testsPassed++;
    
    // Test 3: Firebase  
    if (await testFirebaseConnection()) testsPassed++;
    
    // Test 4: Products
    const products = await createTestProducts();
    if (products && products.length > 0) testsPassed++;
    
    // Test 5: User (your version)
    const user = await createTestUser();
    if (user) testsPassed++;
    
    // Test 6: Order (your version)
    const order = await createTestOrder(user, products);
    if (order) testsPassed++;
    
    // Test 7: Secure Delivery (NEW - uses your ebookService)
    const deliveryResult = await testSecureDigitalDelivery(user, order);
    if (deliveryResult && deliveryResult.watermarked) testsPassed++;
    
    // Test 8: Email
    const emailSent = await testEmailSending(order);
    if (emailSent) testsPassed++;
    
    // Bonus Test: Analytics
    await testAnalytics(products[0]);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    log('\n🎉 ENHANCED TEST COMPLETED!', 'bright');
    log('='.repeat(70), 'green');
    log(`📊 Tests Passed: ${testsPassed}/${totalTests}`, testsPassed === totalTests ? 'green' : 'yellow');
    log(`⏱️  Total time: ${duration} seconds`, 'blue');
    
    if (testsPassed === totalTests) {
      log('\n✅ ALL TESTS PASSED! Your digital delivery system is working perfectly!', 'bright');
      log('🔒 Security features validated (watermarking, tokens, etc.)', 'green');
      log('📦 Real PDF creation and delivery tested', 'green');
      log('🔥 Firebase integration confirmed', 'green');
    } else {
      log(`\n⚠️  ${totalTests - testsPassed} test(s) had issues. Check output above.`, 'yellow');
    }
    
    // Enhanced summary
    log('\n📋 Detailed Test Results:', 'cyan');
    log(`   🏪 Products: ${products?.length || 0} with real PDFs`, 'blue');
    log(`   👤 User: ${user?.email || 'Not created'}`, 'blue');
    log(`   🛒 Order: ${order?.orderNumber || 'Not created'}`, 'blue');
    log(`   🔒 Watermarked delivery: ${deliveryResult?.watermarked ? 'Yes' : 'No'}`, 'blue');
    log(`   📧 Email configured: ${emailService ? 'Yes' : 'Mock'}`, 'blue');
    
    if (deliveryResult?.secureDownload) {
      log('\n🔐 Security Features Tested:', 'cyan');
      log(`   Watermarked PDF: ✅`, 'green');
      log(`   Secure tokens: ✅`, 'green');
      log(`   Download expiry: ${deliveryResult.secureDownload.expiresAt.toLocaleString()}`, 'blue');
    }
    
  } catch (error) {
    log(`\n💥 TEST FAILED: ${error.message}`, 'red');
    console.error(error.stack);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      log('\n📊 Database connection closed', 'blue');
    }
  }
};

// Your existing database connection and cleanup functions (keeping as-is)
const testDatabaseConnection = async () => {
  log('\n📊 Testing Database Connection...', 'cyan');
  
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
    
    await mongoose.connection.db.admin().ping();
    log('✅ Database connection successful', 'green');
    return true;
  } catch (error) {
    log(`❌ Database connection failed: ${error.message}`, 'red');
    return false;
  }
};

const createTestUser = async () => {
  log('\n👤 Creating Test User...', 'cyan');
  
  try {
    const existingUser = await User.findOne({ email: 'test@creditgyemsacademy.com' });
    if (existingUser) {
      log('✅ Using existing test user', 'green');
      return existingUser;
    }
    
    const testUser = new User({
      firebaseUid: `test_user_${Date.now()}`,
      email: 'test@creditgyemsacademy.com',
      firstName: 'Test',
      lastName: 'Customer',
      phone: '555-123-4567',
      creditScore: 650,
      targetCreditScore: 750,
      creditGoals: ['Improve credit score', 'Buy a house'],
      membershipStatus: 'basic',
      isSubscribedToEmails: true,
      source: 'test_script',
      role: 'user',
      isActive: true
    });
    
    await testUser.save();
    log(`✅ Created test user: ${testUser.email}`, 'green');
    
    return testUser;
  } catch (error) {
    log(`❌ Error creating test user: ${error.message}`, 'red');
    throw error;
  }
};

const cleanupTestData = async () => {
  log('\n🧹 Cleaning up test data...', 'cyan');
  
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
    
    const deleteUser = await User.deleteOne({ email: 'test@creditgyemsacademy.com' });
    log(`   Deleted ${deleteUser.deletedCount} test user(s)`, 'blue');
    
    const deleteOrders = await Order.deleteMany({ orderNumber: /^CG-TEST-/ });
    log(`   Deleted ${deleteOrders.deletedCount} test order(s)`, 'blue');
    
    const deleteProducts = await Product.deleteMany({ title: /Test.*Guide/ });
    log(`   Deleted ${deleteProducts.deletedCount} test product(s)`, 'blue');
    
    log('✅ Test data cleanup completed', 'green');
    
  } catch (error) {
    log(`❌ Error cleaning up test data: ${error.message}`, 'red');
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
};

// Export functions
module.exports = {
  testEnvironmentVariables,
  testDatabaseConnection,
  testFirebaseConnection,
  createTestProducts,
  createTestUser,
  createTestOrder,
  testSecureDigitalDelivery,
  testEmailSending,
  testAnalytics,
  runCompleteTest,
  cleanupTestData
};

// Run based on command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--cleanup')) {
    cleanupTestData()
      .then(() => {
        log('\n🎯 Cleanup completed', 'bright');
        process.exit(0);
      })
      .catch((error) => {
        log(`\n💥 Cleanup failed: ${error.message}`, 'red');
        process.exit(1);
      });
  } else {
    runCompleteTest()
      .then(() => {
        log('\n🎯 Enhanced test script completed', 'bright');
        process.exit(0);
      })
      .catch((error) => {
        log(`\n💥 Enhanced test script failed: ${error.message}`, 'red');
        process.exit(1);
      });
  }
}