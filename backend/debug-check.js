// backend/debug-check.js
console.log('🔍 Starting Debug Check...\n');

// Check lead controller
console.log('1. Checking Lead Controller:');
try {
  const leadController = require('./controllers/leadController');
  const methods = Object.keys(leadController);
  console.log(`   ✅ Found ${methods.length} methods:`, methods);
  
  const requiredMethods = ['subscribeNewsletter', 'downloadGuide', 'getLeadAnalytics', 'exportLeads'];
  const missing = requiredMethods.filter(m => !methods.includes(m));
  
  if (missing.length > 0) {
    console.log(`   ❌ Missing methods:`, missing);
  } else {
    console.log('   ✅ All required methods present');
  }
} catch (error) {
  console.log('   ❌ Error loading leadController:', error.message);
}

// Check auth routes
console.log('\n2. Checking Auth Routes:');
try {
  const authRoutes = require('./routes/authRoutes');
  console.log('   ✅ authRoutes.js loaded successfully');
  
  // Check if it's a router
  if (authRoutes && authRoutes.stack) {
    const routes = authRoutes.stack
      .filter(r => r.route)
      .map(r => `${Object.keys(r.route.methods)[0].toUpperCase()} ${r.route.path}`);
    console.log('   Routes found:', routes);
    
    if (routes.some(r => r.includes('/google/callback'))) {
      console.log('   ✅ Google OAuth callback route exists');
    } else {
      console.log('   ❌ Google OAuth callback route missing');
    }
  }
} catch (error) {
  console.log('   ❌ Error loading authRoutes:', error.message);
}

// Check calendar service
console.log('\n3. Checking Calendar Service:');
try {
  const calendarService = require('./services/calendarService');
  console.log('   ✅ calendarService.js loaded successfully');
  
  if (calendarService.getAuthUrl && calendarService.storeTokens) {
    console.log('   ✅ OAuth methods present');
  } else {
    console.log('   ❌ OAuth methods missing');
  }
} catch (error) {
  console.log('   ❌ Error loading calendarService:', error.message);
}

// Check environment variables
console.log('\n4. Checking Environment Variables:');
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET', 
  'GOOGLE_REDIRECT_URI',
  'GOOGLE_CALENDAR_ID'
];

requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`   ✅ ${envVar} is set`);
  } else {
    console.log(`   ❌ ${envVar} is missing`);
  }
});

console.log('\n5. Checking File Structure:');
const fs = require('fs');
const path = require('path');

const checkFile = (filePath) => {
  if (fs.existsSync(path.join(__dirname, filePath))) {
    const stats = fs.statSync(path.join(__dirname, filePath));
    console.log(`   ✅ ${filePath} exists (${stats.size} bytes)`);
  } else {
    console.log(`   ❌ ${filePath} missing`);
  }
};

checkFile('controllers/leadController.js');
checkFile('controllers/contactController.js');
checkFile('routes/authRoutes.js');
checkFile('routes/leadRoutes.js');
checkFile('routes/contactRoutes.js');
checkFile('services/calendarService.js');

console.log('\n✅ Debug check complete!');