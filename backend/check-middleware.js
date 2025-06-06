// check-middleware.js
const path = require('path');

console.log('🔍 Checking authMiddleware implementation...\n');

try {
  const middleware = require('./middleware/authMiddleware');
  console.log('✅ Middleware loaded');
  console.log('   Available exports:', Object.keys(middleware));
  
  // Check if protect function exists
  if (middleware.protect) {
    console.log('   ✅ protect function exists');
  } else {
    console.log('   ❌ protect function missing');
  }
  
  // Check if adminOnly function exists
  if (middleware.adminOnly) {
    console.log('   ✅ adminOnly function exists');
    
    // Show the adminOnly function code if possible
    console.log('\n   adminOnly function:', middleware.adminOnly.toString().substring(0, 200) + '...');
  } else {
    console.log('   ❌ adminOnly function missing');
  }
  
} catch (error) {
  console.error('❌ Error loading middleware:', error.message);
}

// Also check if the middleware file exists
const fs = require('fs');
const middlewarePath = path.join(__dirname, 'middleware', 'authMiddleware.js');

if (fs.existsSync(middlewarePath)) {
  console.log('\n📄 Middleware file exists at:', middlewarePath);
  
  // Read first few lines to check implementation
  const content = fs.readFileSync(middlewarePath, 'utf8');
  const adminOnlyMatch = content.match(/adminOnly[^{]*{[^}]*}/s);
  
  if (adminOnlyMatch) {
    console.log('\n🔍 adminOnly implementation:');
    console.log(adminOnlyMatch[0]);
  }
} else {
  console.log('\n❌ Middleware file not found at:', middlewarePath);
}