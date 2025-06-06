// fix-admin-role.js
// Run this from the backend directory to set admin role

const mongoose = require('mongoose');
require('dotenv').config();

async function fixAdminRole() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/credit-gyems-academy');
        
        const User = mongoose.model('User', {
            email: String,
            role: { type: String, default: 'user' }
        });
        
        // Update any users with admin in email to have admin role
        const result = await User.updateMany(
            { email: { $regex: /admin.*@creditgyemstest\.com$/i } },
            { $set: { role: 'admin' } }
        );
        
        console.log(`Updated ${result.modifiedCount} users to admin role`);
        
        // List all admin users
        const admins = await User.find({ role: 'admin' }).select('email role');
        console.log('Current admin users:', admins);
        
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixAdminRole();
