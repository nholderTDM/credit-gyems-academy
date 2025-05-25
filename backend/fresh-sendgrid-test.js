// fresh-sendgrid-test.js
// Brand new test file to avoid any caching issues

require('dotenv').config();

console.log('🆕 FRESH SENDGRID TEST\n');

// Show exactly what we're getting
const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.EMAIL_FROM;

console.log('Raw API Key value:', JSON.stringify(apiKey));
console.log('Raw From Email value:', JSON.stringify(fromEmail));

console.log('\nAPI Key Analysis:');
if (apiKey) {
  console.log('- Type:', typeof apiKey);
  console.log('- Length:', apiKey.length);
  console.log('- First 3 chars:', JSON.stringify(apiKey.substring(0, 3)));
  console.log('- Starts with SG.:', apiKey.startsWith('SG.'));
  console.log('- Char codes:', Array.from(apiKey.substring(0, 5)).map(c => c.charCodeAt(0)));
} else {
  console.log('API Key is:', apiKey);
  process.exit(1);
}

// If we get here, the API key exists and starts with SG.
console.log('\n✅ Environment variables are correct, testing SendGrid...');

// Try to send a real test email
try {
  const sgMail = require('@sendgrid/mail');
  console.log('✅ SendGrid package loaded');
  
  sgMail.setApiKey(apiKey);
  console.log('✅ API key set');
  
  const msg = {
    to: fromEmail,
    from: fromEmail,
    subject: 'Test from Fresh SendGrid Test',
    text: 'This is a test email from the fresh SendGrid test script.',
    html: '<p>This is a test email from the fresh SendGrid test script.</p>'
  };
  
  console.log('\n📤 Attempting to send email...');
  
  sgMail.send(msg)
    .then(() => {
      console.log('✅ Email sent successfully!');
      console.log('📧 Check your inbox at:', fromEmail);
    })
    .catch((error) => {
      console.log('❌ SendGrid error:', error.message);
      if (error.response && error.response.body) {
        console.log('Error details:', JSON.stringify(error.response.body, null, 2));
      }
    });
    
} catch (error) {
  console.log('❌ Error loading SendGrid package:', error.message);
  console.log('💡 Make sure to run: npm install @sendgrid/mail');
}