// promote-to-admin.js
// Run from backend folder: node promote-to-admin.js email@example.com

const mongoose = require('mongoose');
const User = require('./models/user');
require('dotenv').config();

async function promoteToAdmin(email) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return;
    }
    
    user.role = 'admin';
    await user.save();
    
    console.log(`User ${email} promoted to admin`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

const email = process.argv[2];
if (!email) {
  console.log('Usage: node promote-to-admin.js email@example.com');
  process.exit(1);
}

promoteToAdmin(email);
