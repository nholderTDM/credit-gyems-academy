const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      // Password is required if firebaseUid starts with 'local_'
      return this.firebaseUid && this.firebaseUid.startsWith('local_');
    },
    select: false // Don't include password in queries by default
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  creditScore: {
    type: Number,
    min: 300,
    max: 850
  },
  targetCreditScore: {
    type: Number,
    min: 300,
    max: 850
  },
  creditGoals: [String],
  membershipStatus: {
    type: String,
    enum: ['none', 'basic', 'premium'],
    default: 'none'
  },
  membershipExpiresAt: Date,
  isSubscribedToEmails: {
    type: Boolean,
    default: true
  },
  communicationPreferences: {
    productUpdates: {
      type: Boolean,
      default: true
    },
    creditTips: {
      type: Boolean,
      default: true
    },
    promotions: {
      type: Boolean,
      default: true
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  notes: String,
  source: String,
  utmParameters: {
    source: String,
    medium: String,
    campaign: String
  },
  stripeCustomerId: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: Date,
  isActive: {
    type: Boolean,
    default: true
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  // Update timestamp
  this.updatedAt = Date.now();
  
  // Only hash password if it's modified and exists
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  try {
    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user has Firebase auth
UserSchema.methods.hasFirebaseAuth = function() {
  return this.firebaseUid && !this.firebaseUid.startsWith('local_');
};

module.exports = mongoose.model('User', UserSchema);