const mongoose = require('mongoose');
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
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  phone: String,
  creditScore: Number,
  targetCreditScore: Number,
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

// Update the 'updatedAt' field on save
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', UserSchema);