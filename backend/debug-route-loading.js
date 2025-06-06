// backend/debug-route-loading.js

const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

console.log('🔍 Debugging Route Loading...\n');

// Test MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection failed:', err.message));

// Test loading each route file individually
const routeFiles = [
  'authRoutes',
  'leadRoutes',
  'productRoutes',
  'orderRoutes',
  'bookingRoutes',
  'serviceRoutes',
  'communityRoutes',
  'contactRoutes',
  'cartRoutes'
];

console.log('Testing route files:\n');

routeFiles.forEach(routeFile => {
  try {
    const routes = require(`./routes/${routeFile}`);
    console.log(`✅ ${routeFile} loaded successfully`);
    
    // Try to list the routes
    const app = express();
    app.use('/', routes);
    
    let routeCount = 0;
    app._router.stack.forEach(layer => {
      if (layer.route) {
        routeCount++;
      }
    });
    
    console.log(`   - Contains ${routeCount} routes\n`);
  } catch (error) {
    console.error(`❌ ${routeFile} failed to load:`);
    console.error(`   ${error.message}\n`);
  }
});

// Test the main routes index
console.log('\nTesting main routes index:');
try {
  const mainRoutes = require('./routes/index');
  console.log('✅ Main routes index loaded successfully');
  
  // Create a test app to see what routes are registered
  const testApp = express();
  testApp.use('/api', mainRoutes);
  
  console.log('\nRegistered routes:');
  testApp._router.stack.forEach(middleware => {
    if (middleware.name === 'router' && middleware.handle.stack) {
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          Object.keys(handler.route.methods).forEach(method => {
            console.log(`  ${method.toUpperCase()} /api${handler.route.path}`);
          });
        }
      });
    }
  });
} catch (error) {
  console.error('❌ Main routes index failed:', error.message);
}

// Close MongoDB connection
setTimeout(() => {
  mongoose.connection.close();
  process.exit(0);
}, 2000);