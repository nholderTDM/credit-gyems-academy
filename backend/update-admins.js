const mongoose = require('mongoose');
require('dotenv').config();

async function updateAdmins() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/credit-gyems-academy';
    
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');
        
        const User = mongoose.model('User', {
            email: String,
            role: { type: String, default: 'user' }
        });
        
        // Update all admin pattern emails
        const result = await User.updateMany(
            { email: /admin.*@creditgyemstest\.com$/i },
            { $set: { role: 'admin' } }
        );
        
        console.log(`Updated ${result.modifiedCount} users to admin role`);
        
        // Show updated admins
        const admins = await User.find({ role: 'admin' }).select('email').limit(5);
        console.log('Sample admin users:', admins.map(a => a.email));
        
        await mongoose.disconnect();
        console.log('Done');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

updateAdmins();
