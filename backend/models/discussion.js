const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DiscussionSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['credit_repair', 'credit_coaching', 'financial_planning', 'general', 'success_stories'],
    default: 'general'
  },
  tags: [String],
  viewCount: {
    type: Number,
    default: 0
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['published', 'hidden', 'locked'],
    default: 'published'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastReplyAt: {
    type: Date,
    default: Date.now
  }
});

// Update the 'updatedAt' field on save
DiscussionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Discussion', DiscussionSchema);
