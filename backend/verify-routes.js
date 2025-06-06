// verify-routes.js
// Quick script to verify all routes are loaded
// Run from backend folder: node verify-routes.js

const express = require('express');
const app = express();

console.log('\n🔍 VERIFYING ROUTE REGISTRATION\n');

// Load routes
const routes = [
  { path: '/api/auth', file: './routes/authRoutes', name: 'Auth' },
  { path: '/api/products', file: './routes/productRoutes', name: 'Products' },
  { path: '/api/services', file: './routes/serviceRoutes', name: 'Services' },
  { path: '/api/orders', file: './routes/orderRoutes', name: 'Orders' },
  { path: '/api/bookings', file: './routes/bookingRoutes', name: 'Bookings' },
  { path: '/api/community', file: './routes/communityRoutes', name: 'Community' },
  { path: '/api/leads', file: './routes/leadRoutes', name: 'Leads' },
  { path: '/api/contact', file: './routes/contactRoutes', name: 'Contact' }
];

routes.forEach(route => {
  try {
    const router = require(route.file);
    app.use(route.path, router);
    
    console.log(`✅ ${route.name} routes loaded at ${route.path}`);
    
    // List all routes in this router
    if (router.stack) {
      router.stack.forEach(layer => {
        if (layer.route) {
          const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
          console.log(`   ${methods} ${route.path}${layer.route.path}`);
        }
      });
    }
  } catch (error) {
    console.log(`❌ ${route.name} routes failed: ${error.message}`);
  }
});

// Test specific auth routes
console.log('\n📋 Testing Auth Route Registration:');

try {
  const authRoutes = require('./routes/authRoutes');
  console.log('\nAuth router type:', typeof authRoutes);
  console.log('Is Express Router?', authRoutes.stack ? 'Yes' : 'No');
  
  if (authRoutes.stack) {
    console.log('\nRegistered auth routes:');
    authRoutes.stack.forEach(layer => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
        console.log(`  ${methods} ${layer.route.path}`);
      }
    });
  }
} catch (error) {
  console.error('Error loading auth routes:', error);
}

// Create a test request to /api/auth/login
console.log('\n🧪 Simulating POST /api/auth/login request:');

const mockReq = {
  method: 'POST',
  url: '/api/auth/login',
  path: '/api/auth/login',
  body: { email: 'test@example.com', password: 'test123' },
  headers: {}
};

const mockRes = {
  status: (code) => {
    console.log(`  Response status: ${code}`);
    return mockRes;
  },
  json: (data) => {
    console.log(`  Response data:`, data);
    return mockRes;
  }
};

// Check if route would match
const authRouter = app._router.stack.find(layer => 
  layer.regexp && layer.regexp.test('/api/auth/login')
);

if (authRouter) {
  console.log('  ✅ Route handler found for /api/auth/login');
} else {
  console.log('  ❌ No route handler found for /api/auth/login');
}

process.exit(0);