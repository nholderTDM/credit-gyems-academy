// debug-routes.js
// Let's test routes one by one to find the problem

const express = require('express');
const app = express();

app.use(express.json());

// Test each route pattern individually
console.log('🔍 Testing route patterns...\n');

try {
  // Test 1: Basic route
  console.log('✅ Testing basic route...');
  app.get('/', (req, res) => res.json({ test: 'basic' }));
  
  // Test 2: Route with parameter
  console.log('✅ Testing parameter route...');
  app.get('/test/:id', (req, res) => res.json({ id: req.params.id }));
  
  // Test 3: Your typical API routes
  console.log('✅ Testing API routes...');
  app.get('/api/leads', (req, res) => res.json({ leads: [] }));
  app.post('/api/leads', (req, res) => res.json({ success: true }));
  app.get('/api/leads/:id', (req, res) => res.json({ id: req.params.id }));
  
  console.log('✅ All basic route patterns work fine\n');
  
  // Now let's try to import your actual route files one by one
  console.log('🔍 Testing your actual route files...\n');
  
  // Test leadController first
  try {
    console.log('Testing leadController import...');
    const leadController = require('./controllers/leadController');
    console.log('✅ leadController imports successfully');
  } catch (error) {
    console.log('❌ leadController error:', error.message);
    return;
  }
  
  // Test leadRoutes
  try {
    console.log('Testing leadRoutes import...');
    const leadRoutes = require('./routes/leadRoutes');
    console.log('✅ leadRoutes imports successfully');
    
    // Try to use the routes
    console.log('Testing leadRoutes mounting...');
    app.use('/api/leads-test', leadRoutes);
    console.log('✅ leadRoutes mounts successfully');
  } catch (error) {
    console.log('❌ leadRoutes error:', error.message);
    console.log('❌ This is likely where your problem is!');
    console.log('❌ Stack trace:', error.stack);
    return;
  }
  
  // Test main routes index
  try {
    console.log('Testing main routes index import...');
    const routes = require('./routes/index');
    console.log('✅ routes/index imports successfully');
    
    console.log('Testing main routes mounting...');
    app.use('/api-test', routes);
    console.log('✅ main routes mount successfully');
  } catch (error) {
    console.log('❌ routes/index error:', error.message);
    console.log('❌ This is likely where your problem is!');
    console.log('❌ Stack trace:', error.stack);
    return;
  }
  
  console.log('\n🎉 All routes import and mount successfully!');
  console.log('The problem might be in your server.js file or how routes are being used.');
  
} catch (error) {
  console.log('❌ Route definition error:', error.message);
  console.log('❌ Stack:', error.stack);
}

console.log('\n🏁 Route testing complete');