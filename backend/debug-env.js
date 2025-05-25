// debug-env.js
// Run this with: node debug-env.js

const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

console.log('🔍 DEBUGGING ENVIRONMENT VARIABLES...\n');

// Check current directory
console.log('📁 Current directory:', process.cwd());

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
console.log('📁 Looking for .env at:', envPath);

if (fs.existsSync(envPath)) {
  console.log('✅ .env file found');
  
  // Read the raw file content
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('\n📄 Raw .env file content:');
  console.log('---START OF FILE---');
  console.log(envContent);
  console.log('---END OF FILE---');
  
  // Load environment variables
  const result = dotenv.config();
  
  if (result.error) {
    console.log('\n❌ Error loading .env file:', result.error);
  } else {
    console.log('\n✅ .env file loaded successfully');
  }
  
  // Check specific variables
  console.log('\n🔍 ENVIRONMENT VARIABLE ANALYSIS:');
  
  const sendgridKey = process.env.SENDGRID_API_KEY;
  console.log('SENDGRID_API_KEY exists:', !!sendgridKey);
  
  if (sendgridKey) {
    console.log('SENDGRID_API_KEY length:', sendgridKey.length);
    console.log('SENDGRID_API_KEY first 10 chars:', JSON.stringify(sendgridKey.substring(0, 10)));
    console.log('SENDGRID_API_KEY starts with "SG.":', sendgridKey.startsWith('SG.'));
    
    // Check for invisible characters
    const hasInvisibleChars = /[\x00-\x1f\x7f-\x9f]/.test(sendgridKey);
    console.log('Has invisible characters:', hasInvisibleChars);
    
    // Check for spaces
    const hasSpaces = sendgridKey.includes(' ');
    console.log('Contains spaces:', hasSpaces);
    
    if (hasSpaces) {
      console.log('⚠️  WARNING: API key contains spaces!');
    }
    
    if (hasInvisibleChars) {
      console.log('⚠️  WARNING: API key contains invisible characters!');
    }
  } else {
    console.log('❌ SENDGRID_API_KEY is not defined');
  }
  
  console.log('\n📧 EMAIL CONFIGURATION:');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM || 'NOT SET');
  console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL || 'NOT SET');
  
  console.log('\n🔑 OTHER VARIABLES:');
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
  console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
  
} else {
  console.log('❌ .env file NOT found');
  console.log('💡 Create a .env file in the backend directory');
}

// List all files in current directory
console.log('\n📁 Files in current directory:');
try {
  const files = fs.readdirSync(process.cwd());
  files.forEach(file => {
    if (file.startsWith('.env')) {
      console.log(`  ${file} ✅`);
    } else {
      console.log(`  ${file}`);
    }
  });
} catch (error) {
  console.log('Error reading directory:', error.message);
}