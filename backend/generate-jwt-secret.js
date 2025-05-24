const crypto = require('crypto');

console.log('🔐 Generating JWT Secrets for Credit Gyems Academy...\n');

// Generate multiple options
for (let i = 1; i <= 3; i++) {
  const secret = crypto.randomBytes(64).toString('hex');
  console.log(`Option ${i}:`);
  console.log(secret);
  console.log(`Length: ${secret.length} characters\n`);
}

// Generate a base64 version (alternative format)
const base64Secret = crypto.randomBytes(64).toString('base64');
console.log('Base64 Format Option:');
console.log(base64Secret);
console.log(`Length: ${base64Secret.length} characters\n`);

// Generate using different methods
const uuidSecret = crypto.randomUUID() + crypto.randomUUID() + crypto.randomUUID();
console.log('UUID-based Option:');
console.log(uuidSecret);
console.log(`Length: ${uuidSecret.length} characters\n`);

console.log('✅ Choose any one of the above secrets for your .env file');
console.log('💡 Recommendation: Use the first hex option (64 bytes = 128 hex characters)');
console.log('\nExample .env entry:');
console.log('JWT_SECRET=a1b2c3d4e5f6...(your chosen secret)');