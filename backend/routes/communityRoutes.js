const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Protected routes (require login)
router.get('/discussions', protect, communityController.getDiscussions);
router.post('/discussions', protect, communityController.createDiscussion);
router.get('/discussions/:id', protect, communityController.getDiscussionById);
router.put('/discussions/:id', protect, communityController.updateDiscussion);
router.post('/discussions/:id/posts', protect, communityController.addPost);
router.post('/discussions/:discussionId/posts/:postId/like', protect, communityController.likePost);

// Admin routes
router.put('/discussions/:id/pin', protect, adminOnly, communityController.pinDiscussion);
router.put('/discussions/:id/lock', protect, adminOnly, communityController.lockDiscussion);
router.delete('/discussions/:id', protect, adminOnly, communityController.deleteDiscussion);

module.exports = router;