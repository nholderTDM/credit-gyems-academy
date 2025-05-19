const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LeadSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  firstName: String,
  lastName: String,
  phone: String,
  source: {
    type: String,
    enum: ['landing_page', 'free_guide', 'blog', 'referral', 'other'],
    default: 'landing_page'
  },
  campaign: String,
  landingPage: String,
  referrer: String,
  interests: [String],
  requestedInfo: [String],
  downloadedGuides: [
    {
      guideId: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
      },
      downloadedAt: Date
    }
  ],
  leadScore: {
    type: Number,
    default: 0
  },
  leadStatus: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
    default: 'new'
  },
  followUpDate: Date,
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String,
  interactions: [
    {
      type: {
        type: String,
        enum: ['email', 'call', 'meeting']
      },
      description: String,
      date: {
        type: Date,
        default: Date.now
      },
      performedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  ],
  convertedToUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  convertedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastContactedAt: Date
});

// Update the 'updatedAt' field on save
LeadSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Lead', LeadSchema);