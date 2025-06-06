// fix-admin-role-enhanced.js
// Updates admin role for test users

const mongoose = require('mongoose');
require('dotenv').config();

async function fixAdminRole() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/credit-gyems-academy');
        
        const User = mongoose.model('User', {
            email: String,
            role: { type: String, default: 'user' }
        });
        
        // Update all admin test users from today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const result = await User.updateMany(
            { 
                email: { $regex: /admin.*@creditgyemstest\.com$/i },
                createdAt: { $gte: today }
            },
            { $set: { role: 'admin' } }
        );
        
        console.log(`Updated ${result.modifiedCount} admin users from today`);
        
        // Also update specific pattern
        const patternResult = await User.updateMany(
            { email: { $regex: /admin_\d+_\d+@creditgyemstest\.com$/i } },
            { $set: { role: 'admin' } }
        );
        
        console.log(`Updated ${patternResult.modifiedCount} admin users by pattern`);
        
        // List recent admin users
        const admins = await User.find({ 
            role: 'admin',
            createdAt: { $gte: today }
        }).select('email role createdAt');
        
        console.log('Recent admin users:', admins);
        
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixAdminRole();
