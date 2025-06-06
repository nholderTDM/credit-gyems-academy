// testData.js - Script to create test products
const Product = require('./product');
const { uploadTestPDF } = require('../services/firebaseStorage');

const createTestProducts = async () => {
  try {
    console.log('🚀 Creating test products...');
    
    // Upload test PDF first
    console.log('📄 Uploading test PDF...');
    const uploadResult = await uploadTestPDF();
    
    // Create test products
    const testProducts = [
      {
        title: 'The Ultimate Credit Repair Guide',
        description: 'A comprehensive guide to understanding and improving your credit score. Learn the secrets that credit repair companies don\'t want you to know.',
        shortDescription: 'Complete guide to credit repair and score improvement',
        type: 'ebook',
        price: 29.97,
        compareAtPrice: 49.97,
        digitalFile: {
          fileName: 'ultimate-credit-repair-guide.pdf',
          firebaseFileName: uploadResult.fileName,
          publicUrl: uploadResult.publicUrl,
          fileSize: uploadResult.fileSize || 1024000, // 1MB estimate
          contentType: 'application/pdf',
          uploadedAt: new Date()
        },
        features: [
          'Step-by-step credit repair strategies',
          'Letter templates for disputing errors',
          'Credit monitoring best practices',
          'Building credit from scratch',
          'Advanced credit optimization techniques'
        ],
        pageCount: 87,
        isPopular: true,
        isFeatured: true,
        tags: ['credit repair', 'credit score', 'financial literacy'],
        categories: ['Credit Repair', 'Financial Education'],
        seoTitle: 'Ultimate Credit Repair Guide - Fix Your Credit Score Fast',
        seoDescription: 'Learn proven strategies to repair your credit score and achieve financial freedom with our comprehensive guide.',
        status: 'published',
        publishedAt: new Date()
      },
      {
        title: 'Financial Freedom Roadmap',
        description: 'Your complete roadmap to achieving financial independence. From budgeting basics to investment strategies.',
        shortDescription: 'Step-by-step guide to financial independence',
        type: 'ebook',
        price: 19.97,
        digitalFile: {
          fileName: 'financial-freedom-roadmap.pdf',
          firebaseFileName: uploadResult.fileName, // Reusing same file for testing
          publicUrl: uploadResult.publicUrl,
          fileSize: 950000,
          contentType: 'application/pdf',
          uploadedAt: new Date()
        },
        features: [
          'Budgeting strategies that work',
          'Debt elimination plans',
          'Investment basics for beginners',
          'Emergency fund planning',
          'Retirement planning essentials'
        ],
        pageCount: 65,
        tags: ['financial planning', 'budgeting', 'investing'],
        categories: ['Financial Planning', 'Wealth Building'],
        status: 'published',
        publishedAt: new Date()
      },
      {
        title: 'Credit Coaching Masterclass',
        description: 'Live masterclass covering advanced credit optimization strategies and Q&A session.',
        shortDescription: 'Live masterclass on advanced credit strategies',
        type: 'masterclass',
        price: 97.00,
        compareAtPrice: 197.00,
        duration: 120, // 2 hours
        features: [
          'Live 2-hour session with DorTae Freeman',
          'Advanced credit optimization strategies',
          'Live Q&A session',
          'Recorded session access',
          'Bonus credit templates'
        ],
        isPopular: true,
        tags: ['masterclass', 'credit coaching', 'live training'],
        categories: ['Masterclass', 'Credit Coaching'],
        status: 'published',
        publishedAt: new Date()
      }
    ];

    // Insert products into database
    const createdProducts = await Product.insertMany(testProducts);
    
    console.log(`✅ Successfully created ${createdProducts.length} test products:`);
    createdProducts.forEach(product => {
      console.log(`   📦 ${product.title} - $${product.price} (${product.type})`);
    });
    
    return createdProducts;
  } catch (error) {
    console.error('❌ Error creating test products:', error);
    throw error;
  }
};

// Function to run the test data creation
const runTestDataCreation = async () => {
  try {
    // Connect to MongoDB if not already connected
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to MongoDB for test data creation');
    }
    
    // Clear existing test products (optional)
    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing products. Delete them? (y/N)`);
      // In real implementation, you'd prompt for confirmation
      // await Product.deleteMany({});
      // console.log('🗑️  Cleared existing products');
    }
    
    // Create test products
    const products = await createTestProducts();
    
    console.log('🎉 Test data creation completed successfully!');
    console.log('📋 Summary:');
    console.log(`   Products created: ${products.length}`);
    console.log(`   Firebase Storage: ✅ Connected`);
    console.log(`   Database: ✅ Connected`);
    
    return products;
  } catch (error) {
    console.error('💥 Test data creation failed:', error);
    throw error;
  }
};

module.exports = {
  Product,
  createTestProducts,
  runTestDataCreation
};