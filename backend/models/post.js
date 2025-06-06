const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  discussionId: {
    type: Schema.Types.ObjectId,
    ref: 'Discussion',
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  parentPostId: {
    type: Schema.Types.ObjectId,
    ref: 'Post'
  },
  likeCount: {
    type: Number,
    default: 0
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  isHidden: {
    type: Boolean,
    default: false
  },
  hiddenReason: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the 'updatedAt' field on save
PostSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Post', PostSchema);