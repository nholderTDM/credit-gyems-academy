const mongoose = require('mongoose');
require('dotenv').config();

async function checkProductModel() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  
  try {
    const Product = require('./models/product');
    const schema = Product.schema;
    
    console.log('\nProduct Model Required Fields:');
    const requiredFields = [];
    Object.keys(schema.paths).forEach(path => {
      if (schema.paths[path].isRequired) {
        requiredFields.push(path);
        console.log(`  - ${path}: ${schema.paths[path].instance}`);
      }
    });
    
    // Try creating a product with test data
    console.log('\nTesting product creation...');
    const testProduct = {
      type: 'ebook',
      title: 'Test Product',
      price: 49.99,
      description: 'Test description',
      shortDescription: 'Short desc',
      features: ['Feature 1'],
      status: 'published'
    };
    
    // Add any missing required fields
    if (requiredFields.includes('name') && !testProduct.name) {
      testProduct.name = testProduct.title;
    }
    if (requiredFields.includes('slug') && !testProduct.slug) {
      testProduct.slug = testProduct.title.toLowerCase().replace(/\s+/g, '-');
    }
    if (requiredFields.includes('category') && !testProduct.category) {
      testProduct.category = 'guides';
    }
    
    const product = new Product(testProduct);
    await product.validate();
    console.log('✅ Product validates with test data');
    console.log('\nRequired fields for product creation:', requiredFields);
    
  } catch (err) {
    console.error('❌ Product validation failed:', err.message);
    if (err.errors) {
      console.log('Missing fields:');
      Object.keys(err.errors).forEach(field => {
        console.log(`  - ${field}: ${err.errors[field].message}`);
      });
    }
  }
  
  await mongoose.disconnect();
}

checkProductModel().catch(console.error);
