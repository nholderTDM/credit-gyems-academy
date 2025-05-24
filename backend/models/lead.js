const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LeadSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: [100, 'Email cannot exceed 100 characters']
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  
  // Source Information
  source: {
    type: String,
    enum: ['landing_page', 'free_guide', 'blog', 'referral', 'social_media', 'website', 'other'],
    default: 'website'
  },
  landingPage: {
    type: String,
    trim: true,
    maxlength: [500, 'Landing page URL cannot exceed 500 characters']
  },
  campaign: {
    type: String,
    trim: true,
    maxlength: [100, 'Campaign name cannot exceed 100 characters']
  },
  referrer: {
    type: String,
    trim: true,
    maxlength: [500, 'Referrer URL cannot exceed 500 characters']
  },
  
  // Interest Information
  interests: [{
    type: String,
    trim: true,
    maxlength: [100, 'Interest cannot exceed 100 characters']
  }],
  requestedInfo: [{
    type: String,
    trim: true,
    maxlength: [100, 'Requested info cannot exceed 100 characters']
  }],
  downloadedGuides: [{
    guideId: {
      type: Schema.Types.ObjectId,
      ref: 'Product'
    },
    downloadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Lead Qualification
  leadScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  leadStatus: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
    default: 'new'
  },
  
  // Follow-up
  followUpDate: {
    type: Date,
    validate: {
      validator: function(date) {
        return !date || date >= new Date();
      },
      message: 'Follow-up date cannot be in the past'
    }
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Notes & Interactions
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  interactions: [{
    type: {
      type: String,
      enum: ['email', 'call', 'meeting', 'form_submission', 'download'],
      required: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Interaction description cannot exceed 500 characters']
    },
    date: {
      type: Date,
      default: Date.now
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Conversion
  convertedToUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  convertedAt: Date,
  
  // Communication Preferences
  isSubscribedToEmails: {
    type: Boolean,
    default: true
  },
  emailOptOutDate: Date,
  
  // UTM Parameters
  utmParameters: {
    source: String,
    medium: String,
    campaign: String,
    term: String,
    content: String
  },
  
  // System Fields
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastContactedAt: {
    type: Date,
    default: Date.now
  },
  
  // Privacy & Compliance
  gdprConsent: {
    type: Boolean,
    default: false
  },
  gdprConsentDate: Date,
  dataRetentionExpiry: Date
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
LeadSchema.index({ email: 1 }, { unique: true });
LeadSchema.index({ leadStatus: 1 });
LeadSchema.index({ source: 1 });
LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ assignedTo: 1 });
LeadSchema.index({ convertedToUserId: 1 });
LeadSchema.index({ followUpDate: 1 });

// Compound indexes
LeadSchema.index({ leadStatus: 1, createdAt: -1 });
LeadSchema.index({ source: 1, createdAt: -1 });

// Virtual for full name
LeadSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  } else if (this.firstName) {
    return this.firstName;
  } else if (this.lastName) {
    return this.lastName;
  }
  return '';
});

// Virtual for days since creation
LeadSchema.virtual('daysOld').get(function() {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to update the updatedAt field
LeadSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Pre-save middleware to validate email uniqueness
LeadSchema.pre('save', async function(next) {
  if (this.isModified('email')) {
    const existing = await this.constructor.findOne({ 
      email: this.email,
      _id: { $ne: this._id }
    });
    
    if (existing) {
      const error = new Error('Email address already exists');
      error.name = 'ValidationError';
      return next(error);
    }
  }
  next();
});

// Static method to find leads needing follow-up
LeadSchema.statics.findDueForFollowUp = function() {
  return this.find({
    followUpDate: { $lte: new Date() },
    leadStatus: { $in: ['new', 'contacted', 'qualified'] }
  });
};

// Static method to get conversion stats
LeadSchema.statics.getConversionStats = function(startDate, endDate) {
  const matchStage = {};
  
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$leadStatus',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Instance method to add interaction
LeadSchema.methods.addInteraction = function(type, description, performedBy) {
  this.interactions.push({
    type,
    description,
    performedBy,
    date: new Date()
  });
  
  this.lastContactedAt = new Date();
  
  return this.save();
};

// Instance method to calculate lead score (basic implementation)
LeadSchema.methods.calculateLeadScore = function() {
  let score = 0;
  
  // Points for having contact information
  if (this.firstName) score += 10;
  if (this.lastName) score += 10;
  if (this.phone) score += 15;
  
  // Points for interests
  score += this.interests.length * 5;
  
  // Points for downloads
  score += this.downloadedGuides.length * 10;
  
  // Points for interactions
  score += this.interactions.length * 5;
  
  // Bonus for certain sources
  if (['referral', 'free_guide'].includes(this.source)) {
    score += 15;
  }
  
  // Cap at 100
  this.leadScore = Math.min(100, score);
  
  return this.leadScore;
};

module.exports = mongoose.model('Lead', LeadSchema);