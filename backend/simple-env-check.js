require('dotenv').config();

console.log('🔍 SIMPLE ENVIRONMENT CHECK\n');

console.log('Current Directory:', process.cwd());
console.log('Node Version:', process.version);

console.log('\n📧 EMAIL CONFIGURATION:');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);

console.log('\n🔑 SENDGRID CONFIGURATION:');
const apiKey = process.env.SENDGRID_API_KEY;

if (apiKey) {
  console.log('✅ SENDGRID_API_KEY found');
  console.log('Length:', apiKey.length);
  console.log('First 10 characters:', apiKey.substring(0, 10));
  console.log('Starts with SG.:', apiKey.startsWith('SG.'));
  console.log('Full key (hidden):', 'SG.' + '*'.repeat(apiKey.length - 3));
} else {
  console.log('❌ SENDGRID_API_KEY not found');
}

console.log('\n🗄️ OTHER ENVIRONMENT VARIABLES:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

console.log('\n📁 ALL ENVIRONMENT VARIABLES STARTING WITH "SENDGRID":');
Object.keys(process.env)
  .filter(key => key.startsWith('SENDGRID'))
  .forEach(key => {
    console.log(`${key}:`, process.env[key] ? 'SET' : 'NOT SET');
  });

console.log('\n📁 ALL ENVIRONMENT VARIABLES STARTING WITH "EMAIL":');
Object.keys(process.env)
  .filter(key => key.startsWith('EMAIL'))
  .forEach(key => {
    console.log(`${key}:`, process.env[key]);
  });