// fix-community-test.js
// Temporary fix for community test issues
// Run from backend folder: node fix-community-test.js

const mongoose = require('mongoose');
require('dotenv').config();

async function fixCommunityIssues() {
  try {
    console.log('🔧 Fixing Community Test Issues\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check if Discussion model exists
    let Discussion;
    try {
      Discussion = require('./models/discussion');
      console.log('✅ Discussion model found');
    } catch (error) {
      console.log('❌ Discussion model not found, creating...');
      
      // Create a basic Discussion schema if missing
      const DiscussionSchema = new mongoose.Schema({
        title: { type: String, required: true },
        content: { type: String, required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        category: { 
          type: String, 
          enum: ['credit_repair', 'credit_coaching', 'financial_planning', 'success_stories', 'general'],
          default: 'general'
        },
        tags: [String],
        viewCount: { type: Number, default: 0 },
        isPinned: { type: Boolean, default: false },
        isLocked: { type: Boolean, default: false },
        status: { type: String, enum: ['published', 'hidden', 'locked'], default: 'published' },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
      });
      
      Discussion = mongoose.model('Discussion', DiscussionSchema);
      console.log('✅ Created Discussion model');
    }
    
    // Check if Post model exists
    let Post;
    try {
      Post = require('./models/post');
      console.log('✅ Post model found');
    } catch (error) {
      console.log('❌ Post model not found, creating...');
      
      // Create a basic Post schema if missing
      const PostSchema = new mongoose.Schema({
        content: { type: String, required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        discussion: { type: mongoose.Schema.Types.ObjectId, ref: 'Discussion', required: true },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        isEdited: { type: Boolean, default: false },
        editedAt: Date,
        status: { type: String, enum: ['published', 'hidden', 'deleted'], default: 'published' },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
      });
      
      Post = mongoose.model('Post', PostSchema);
      console.log('✅ Created Post model');
    }
    
    // Test creating a discussion
    console.log('\n🧪 Testing discussion creation...');
    
    // First create a test user
    const User = require('./models/user');
    let testUser = await User.findOne({ email: /test.*@/i });
    
    if (!testUser) {
      testUser = await User.create({
        email: 'community-test@example.com',
        password: 'Test123!',
        firstName: 'Community',
        lastName: 'Test',
        firebaseUid: 'test-' + Date.now()
      });
      console.log('✅ Created test user');
    }
    
    // Create a test discussion
    const testDiscussion = await Discussion.create({
      title: 'Test Discussion',
      content: 'This is a test discussion',
      author: testUser._id,
      category: 'general'
    });
    
    console.log('✅ Test discussion created:', testDiscussion._id);
    
    // Create a test post
    const testPost = await Post.create({
      content: 'This is a test post',
      author: testUser._id,
      discussion: testDiscussion._id
    });
    
    console.log('✅ Test post created:', testPost._id);
    
    // Clean up test data
    await Post.deleteOne({ _id: testPost._id });
    await Discussion.deleteOne({ _id: testDiscussion._id });
    console.log('✅ Test data cleaned up');
    
    console.log('\n✅ Community models are working correctly');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Also create the model files if they don't exist
const fs = require('fs');
const path = require('path');

// Create Post model if it doesn't exist
const postModelPath = path.join(__dirname, 'models', 'post.js');
if (!fs.existsSync(postModelPath)) {
  console.log('📝 Creating models/post.js...');
  
  const postModelContent = `const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  content: {
    type: String,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  discussion: {
    type: Schema.Types.ObjectId,
    ref: 'Discussion',
    required: true
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  status: {
    type: String,
    enum: ['published', 'hidden', 'deleted'],
    default: 'published'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
PostSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.isModified('content') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = Date.now();
  }
  next();
});

module.exports = mongoose.model('Post', PostSchema);`;
  
  fs.writeFileSync(postModelPath, postModelContent);
  console.log('✅ Created models/post.js');
}

fixCommunityIssues();