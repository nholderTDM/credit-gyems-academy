const Discussion = require('../models/discussion');
const Post = require('../models/post');
const Like = require('../models/like');
const mongoose = require('mongoose');

// Get all discussions
exports.getDiscussions = async (req, res, next) => {
  try {
    const { category, sort = 'latest', page = 1, limit = 10, search } = req.query;
    
    // Build query
    const query = { status: 'published' };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Determine sort order
    let sortOrder = {};
    
    if (sort === 'latest') {
      sortOrder = { isPinned: -1, updatedAt: -1 };
    } else if (sort === 'popular') {
      sortOrder = { isPinned: -1, viewCount: -1 };
    }
    
    // Count total discussions
    const total = await Discussion.countDocuments(query);
    
    // Fetch discussions with pagination
    const discussions = await Discussion.find(query)
      .populate('author', 'firstName lastName')
      .sort(sortOrder)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    // Get post counts and last reply dates
    const discussionsWithMeta = await Promise.all(discussions.map(async (discussion) => {
      const postCount = await Post.countDocuments({ discussionId: discussion._id });
      
      const lastPost = await Post.findOne({ discussionId: discussion._id })
        .sort({ createdAt: -1 })
        .select('createdAt');
      
      return {
        _id: discussion._id,
        title: discussion.title,
        category: discussion.category,
        author: {
          _id: discussion.author._id,
          firstName: discussion.author.firstName,
          lastName: discussion.author.lastName
        },
        viewCount: discussion.viewCount,
        isPinned: discussion.isPinned,
        status: discussion.status,
        createdAt: discussion.createdAt,
        updatedAt: discussion.updatedAt,
        postCount: postCount,
        lastPost: lastPost ? lastPost.createdAt : null
      };
    }));
    
    res.status(200).json({
      success: true,
      data: {
        discussions: discussionsWithMeta,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching discussions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discussions'
    });
  }
};

// Create new discussion
exports.createDiscussion = async (req, res, next) => {
  try {
    const { title, content, category, tags } = req.body;
    const userId = req.user._id;
    
    const discussion = new Discussion({
      title,
      content,
      author: userId,
      category: category || 'general',
      tags: tags || [],
      lastReplyAt: new Date()
    });
    
    await discussion.save();
    
    res.status(201).json({
      success: true,
      data: discussion
    });
  } catch (error) {
    console.error('Error creating discussion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create discussion'
    });
  }
};

// Get discussion by ID
exports.getDiscussionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discussion ID'
      });
    }
    
    // Increment view count
    const discussion = await Discussion.findByIdAndUpdate(
      id,
      { $inc: { viewCount: 1 } },
      { new: true }
    ).populate('author', 'firstName lastName');
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }
    
    // Get posts for discussion
    const posts = await Post.find({ discussionId: id, isHidden: false })
      .populate('author', 'firstName lastName')
      .sort({ createdAt: 1 });
    
    // Check which posts the user has liked
    const userId = req.user._id;
    const userLikes = await Like.find({
      userId,
      targetType: 'post',
      targetId: { $in: posts.map(post => post._id) }
    });
    
    const userLikedPostIds = userLikes.map(like => like.targetId.toString());
    
    // Transform posts for response
    const transformedPosts = posts.map(post => ({
      _id: post._id,
      content: post.content,
      author: {
        _id: post.author._id,
        firstName: post.author.firstName,
        lastName: post.author.lastName
      },
      likeCount: post.likeCount,
      userLiked: userLikedPostIds.includes(post._id.toString()),
      isEdited: post.isEdited,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }));
    
    res.status(200).json({
      success: true,
      data: {
        discussion: {
          _id: discussion._id,
          title: discussion.title,
          content: discussion.content,
          author: {
            _id: discussion.author._id,
            firstName: discussion.author.firstName,
            lastName: discussion.author.lastName
          },
          category: discussion.category,
          tags: discussion.tags,
          viewCount: discussion.viewCount,
          isPinned: discussion.isPinned,
          status: discussion.status,
          createdAt: discussion.createdAt,
          updatedAt: discussion.updatedAt
        },
        posts: transformedPosts
      }
    });
  } catch (error) {
    console.error('Error fetching discussion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discussion'
    });
  }
};

// Update discussion
exports.updateDiscussion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags } = req.body;
    const userId = req.user._id;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discussion ID'
      });
    }
    
    const discussion = await Discussion.findById(id);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }
    
    // Check if user is author or admin
    if (discussion.author.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this discussion'
      });
    }
    
    // Update discussion
    discussion.title = title || discussion.title;
    discussion.content = content || discussion.content;
    discussion.category = category || discussion.category;
    discussion.tags = tags || discussion.tags;
    discussion.updatedAt = new Date();
    
    await discussion.save();
    
    res.status(200).json({
      success: true,
      data: discussion
    });
  } catch (error) {
    console.error('Error updating discussion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update discussion'
    });
  }
};

// Create post (reply to discussion)
exports.addPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, parentPostId } = req.body;
    const userId = req.user._id;
    
    // Validate discussion ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discussion ID'
      });
    }
    
    const discussion = await Discussion.findById(id);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }
    
    // Check if discussion is locked
    if (discussion.status === 'locked') {
      return res.status(403).json({
        success: false,
        message: 'This discussion is locked. New replies are not allowed.'
      });
    }
    
    // Validate parent post ID if provided
    if (parentPostId && !mongoose.Types.ObjectId.isValid(parentPostId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid parent post ID'
      });
    }
    
    // Create post
    const post = new Post({
      discussionId: id,
      author: userId,
      content,
      parentPostId: parentPostId || null
    });
    
    await post.save();
    
    // Update discussion lastReplyAt
    discussion.lastReplyAt = new Date();
    discussion.updatedAt = new Date();
    await discussion.save();
    
    // Return post with author info
    const populatedPost = await Post.findById(post._id).populate('author', 'firstName lastName');
    
    res.status(201).json({
      success: true,
      data: {
        _id: populatedPost._id,
        content: populatedPost.content,
        author: {
          _id: populatedPost.author._id,
          firstName: populatedPost.author.firstName,
          lastName: populatedPost.author.lastName
        },
        likeCount: 0,
        userLiked: false,
        isEdited: false,
        createdAt: populatedPost.createdAt,
        updatedAt: populatedPost.updatedAt
      }
    });
  } catch (error) {
    console.error('Error adding post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add post'
    });
  }
};

// Like/unlike post
exports.likePost = async (req, res, next) => {
  try {
    const { discussionId, postId } = req.params;
    const userId = req.user._id;
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(discussionId) || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discussion or post ID'
      });
    }
    
    // Check if post exists and belongs to the discussion
    const post = await Post.findOne({
      _id: postId,
      discussionId
    });
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Check if user has already liked the post
    const existingLike = await Like.findOne({
      userId,
      targetType: 'post',
      targetId: postId
    });
    
    let liked = true;
    
    if (existingLike) {
      // Unlike post
      await Like.findByIdAndDelete(existingLike._id);
      
      // Decrement like count
      post.likeCount = Math.max(0, post.likeCount - 1);
      liked = false;
    } else {
      // Like post
      const like = new Like({
        userId,
        targetType: 'post',
        targetId: postId
      });
      
      await like.save();
      
      // Increment like count
      post.likeCount = (post.likeCount || 0) + 1;
    }
    
    await post.save();
    
    res.status(200).json({
      success: true,
      data: {
        liked,
        likeCount: post.likeCount
      }
    });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process like'
    });
  }
};

// Pin/unpin discussion (admin only)
exports.pinDiscussion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isPinned } = req.body;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discussion ID'
      });
    }
    
    const discussion = await Discussion.findById(id);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }
    
    // Update pin status
    discussion.isPinned = Boolean(isPinned);
    await discussion.save();
    
    res.status(200).json({
      success: true,
      data: {
        _id: discussion._id,
        isPinned: discussion.isPinned
      }
    });
  } catch (error) {
    console.error('Error pinning discussion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to pin discussion'
    });
  }
};

// Lock/unlock discussion (admin only)
exports.lockDiscussion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discussion ID'
      });
    }
    
    if (!['published', 'locked'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "published" or "locked".'
      });
    }
    
    const discussion = await Discussion.findById(id);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }
    
    // Update status
    discussion.status = status;
    await discussion.save();
    
    res.status(200).json({
      success: true,
      data: {
        _id: discussion._id,
        status: discussion.status
      }
    });
  } catch (error) {
    console.error('Error updating discussion status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update discussion status'
    });
  }
};

// Delete discussion (admin only)
exports.deleteDiscussion = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discussion ID'
      });
    }
    
    const discussion = await Discussion.findById(id);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }
    
    // Delete all posts and likes
    const posts = await Post.find({ discussionId: id });
    const postIds = posts.map(post => post._id);
    
    await Like.deleteMany({ targetType: 'post', targetId: { $in: postIds } });
    await Post.deleteMany({ discussionId: id });
    
    // Delete discussion
    await Discussion.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Discussion deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting discussion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete discussion'
    });
  }
};// Community controller fix for createDiscussion
exports.createDiscussion = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    
    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }
    
    const discussion = new Discussion({
      title,
      content,
      author: req.user._id,
      category: category || 'general',
      tags: tags || []
    });
    
    await discussion.save();
    
    // Populate author info
    await discussion.populate('author', 'firstName lastName email');
    
    res.status(201).json({
      success: true,
      data: discussion,
      _id: discussion._id  // Include _id at top level for tests
    });
  } catch (error) {
    console.error('Create discussion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create discussion',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
