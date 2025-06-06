import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';

// Components
import Loader from '../components/common/Loader';
import ErrorDisplay from '../components/common/ErrorDisplay';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import { FaArrowLeft, FaEdit, FaLock, FaUnlock, FaHeart, FaRegHeart, FaReply, FaThumbtack, FaEllipsisV } from 'react-icons/fa';

const DiscussionPage = () => {
  const { id } = useParams();
  const { currentUser, token } = useAuth();
  const navigate = useNavigate();
  
  const [discussion, setDiscussion] = useState(null);
  const [posts, setPosts] = useState([]);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [showActions, setShowActions] = useState(null);
  
  const replyRef = useRef(null);
  const actionsRef = useRef(null);

  // Categories for display
  const categories = [
    { value: 'general', label: 'General Discussion', color: '#FFD700' },
    { value: 'credit_repair', label: 'Credit Repair', color: '#FF0000' },
    { value: 'credit_coaching', label: 'Credit Coaching', color: '#26A69A' },
    { value: 'financial_planning', label: 'Financial Planning', color: '#0A2342' },
    { value: 'success_stories', label: 'Success Stories', color: '#E8E8E8' }
  ];

  // Fetch discussion data
  useEffect(() => {
    const fetchDiscussion = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get(
          `/api/community/discussions/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setDiscussion(response.data.data.discussion);
        setPosts(response.data.data.posts);
      } catch (err) {
        console.error('Error fetching discussion:', err);
        setError('Failed to load discussion. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (token && id) {
      fetchDiscussion();
    }
  }, [id, token]);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setShowActions(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Post a reply
  const handlePostReply = async () => {
    if (!replyContent.trim()) return;
    
    try {
      setSubmitting(true);
      
      const response = await axios.post(
        `/api/community/discussions/${id}/posts`,
        { content: replyContent },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setPosts([...posts, response.data.data]);
      setReplyContent('');
      toast.success('Reply posted successfully!');
    } catch (err) {
      console.error('Error posting reply:', err);
      toast.error('Failed to post reply. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit a post
  const handleEditPost = async (postId) => {
    if (!editContent.trim()) return;
    
    try {
      setSubmitting(true);
      
      const response = await axios.put(
        `/api/community/discussions/${id}/posts/${postId}`,
        { content: editContent },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update posts state
      setPosts(posts.map(post => 
        post._id === postId ? response.data.data : post
      ));
      
      setEditingPostId(null);
      setEditContent('');
      toast.success('Post updated successfully!');
    } catch (err) {
      console.error('Error updating post:', err);
      toast.error('Failed to update post. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete a post
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(
        `/api/community/discussions/${id}/posts/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Remove post from state
      setPosts(posts.filter(post => post._id !== postId));
      toast.success('Post deleted successfully!');
    } catch (err) {
      console.error('Error deleting post:', err);
      toast.error('Failed to delete post. Please try again later.');
    }
  };

  // Like/unlike a post
  const handleLikePost = async (postId) => {
    try {
      await axios.post(
        `/api/community/discussions/${id}/posts/${postId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update post likes in state
      setPosts(posts.map(post => {
        if (post._id === postId) {
          // Toggle like status and update count
          const userLiked = post.userLiked;
          return {
            ...post,
            userLiked: !userLiked,
            likeCount: userLiked ? post.likeCount - 1 : post.likeCount + 1
          };
        }
        return post;
      }));
    } catch (err) {
      console.error('Error liking post:', err);
      toast.error('Failed to process like. Please try again later.');
    }
  };

  // Pin/unpin discussion (admin only)
  const handlePinDiscussion = async () => {
    if (!discussion) return;
    
    try {
      const response = await axios.put(
        `/api/community/discussions/${id}/pin`,
        { isPinned: !discussion.isPinned },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setDiscussion({
        ...discussion,
        isPinned: response.data.data.isPinned
      });
      
      toast.success(discussion.isPinned ? 'Discussion unpinned!' : 'Discussion pinned!');
    } catch (err) {
      console.error('Error pinning discussion:', err);
      toast.error('Failed to pin/unpin discussion. Please try again later.');
    }
  };

  // Lock/unlock discussion (admin only)
  const handleLockDiscussion = async () => {
    if (!discussion) return;
    
    try {
      const newStatus = discussion.status === 'locked' ? 'published' : 'locked';
      
      const response = await axios.put(
        `/api/community/discussions/${id}/lock`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setDiscussion({
        ...discussion,
        status: response.data.data.status
      });
      
      toast.success(newStatus === 'locked' ? 'Discussion locked!' : 'Discussion unlocked!');
    } catch (err) {
      console.error('Error locking discussion:', err);
      toast.error('Failed to lock/unlock discussion. Please try again later.');
    }
  };

  // Start editing a post
  const startEditPost = (post) => {
    setEditingPostId(post._id);
    setEditContent(post.content);
  };

  // Cancel editing
  const cancelEditPost = () => {
    setEditingPostId(null);
    setEditContent('');
  };

  // Format date display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Get category details
  const getCategoryDetails = (categoryValue) => {
    return categories.find(cat => cat.value === categoryValue) || { value: categoryValue, label: categoryValue, color: '#FFD700' };
  };

  // Check if user is admin
  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };

  // Check if user can edit a post
  const canEditPost = (post) => {
    return currentUser?._id === post.author._id || isAdmin();
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <ErrorDisplay 
        message={error}
        actionText="Back to Community"
        onAction={() => navigate('/community')}
      />
    );
  }

  if (!discussion) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <p className="text-slate-600 mb-4">Discussion not found.</p>
          <Button 
            variant="primary"
            onClick={() => navigate('/community')}
          >
            Back to Community
          </Button>
        </div>
      </div>
    );
  }

  const categoryDetails = getCategoryDetails(discussion.category);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link 
          to="/community"
          className="flex items-center text-yellow-500 hover:text-yellow-600 font-medium transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to Discussions
        </Link>
      </div>
      
      {/* Discussion Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-slate-100 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-grow">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{discussion.title}</h1>
              
              {discussion.isPinned && (
                <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  <FaThumbtack className="mr-1" /> Pinned
                </span>
              )}
              
              {discussion.status === 'locked' && (
                <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                  <FaLock className="mr-1" /> Locked
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center text-sm text-slate-500 mt-2 mb-4">
              <div className="flex items-center mr-4">
                <Avatar 
                  name={`${discussion.author.firstName} ${discussion.author.lastName}`}
                  image={discussion.author.profileImage}
                  size="sm"
                />
                <span className="ml-2">{discussion.author.firstName} {discussion.author.lastName}</span>
              </div>
              
              <span className="mr-2">•</span>
              <span className="mr-4" title={formatDate(discussion.createdAt)}>
                {formatRelativeTime(discussion.createdAt)}
              </span>
              
              <span className="mr-2">•</span>
              <span 
                className="px-2.5 py-0.5 text-xs font-medium rounded-full mr-4"
                style={{ backgroundColor: `${categoryDetails.color}20`, color: categoryDetails.color }}
              >
                {categoryDetails.label}
              </span>
              
              <span className="mr-2">•</span>
              <span>{discussion.viewCount} views</span>
            </div>
          </div>
          
          {/* Admin Actions or Author Actions */}
          {(isAdmin() || currentUser?._id === discussion.author._id) && (
            <div className="relative" ref={actionsRef}>
              <button 
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                onClick={() => setShowActions(showActions === 'discussion' ? null : 'discussion')}
              >
                <FaEllipsisV />
              </button>
              
              {showActions === 'discussion' && (
                <div className="absolute right-0 w-48 mt-2 py-2 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                  <Link 
                    to={`/community/discussions/${id}/edit`}
                    className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 w-full text-left"
                  >
                    <FaEdit className="mr-2" /> Edit Discussion
                  </Link>
                  
                  {isAdmin() && (
                    <>
                      <button 
                        className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 w-full text-left"
                        onClick={handlePinDiscussion}
                      >
                        <FaThumbtack className="mr-2" /> 
                        {discussion.isPinned ? 'Unpin Discussion' : 'Pin Discussion'}
                      </button>
                      
                      <button 
                        className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 w-full text-left"
                        onClick={handleLockDiscussion}
                      >
                        {discussion.status === 'locked' ? (
                          <>
                            <FaUnlock className="mr-2" /> Unlock Discussion
                          </>
                        ) : (
                          <>
                            <FaLock className="mr-2" /> Lock Discussion
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="prose max-w-none text-slate-700 whitespace-pre-line border-b border-slate-200 pb-6 mb-4">
          {discussion.content}
        </div>
        
        <div className="text-sm text-slate-500">
          {posts.length} {posts.length === 1 ? 'reply' : 'replies'}
        </div>
      </div>
      
      {/* Posts / Replies */}
      {posts.length > 0 && (
        <div className="mb-8 space-y-6">
          {posts.map(post => (
            <div 
              key={post._id}
              id={`post-${post._id}`}
              className="bg-white rounded-xl shadow-md p-6 border border-slate-100"
            >
              <div className="flex items-start gap-4 mb-4">
                <Avatar 
                  name={`${post.author.firstName} ${post.author.lastName}`}
                  image={post.author.profileImage}
                  size="md"
                />
                
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-slate-800">
                        {post.author.firstName} {post.author.lastName}
                      </div>
                      <div className="text-sm text-slate-500" title={formatDate(post.createdAt)}>
                        {formatRelativeTime(post.createdAt)}
                        {post.isEdited && (
                          <span className="ml-2 text-xs">(edited)</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Post Actions */}
                    {canEditPost(post) && (
                      <div className="relative">
                        <button 
                          className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                          onClick={() => setShowActions(showActions === post._id ? null : post._id)}
                        >
                          <FaEllipsisV />
                        </button>
                        
                        {showActions === post._id && (
                          <div className="absolute right-0 w-40 mt-2 py-2 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                            <button 
                              className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 w-full text-left"
                              onClick={() => startEditPost(post)}
                            >
                              <FaEdit className="mr-2" /> Edit
                            </button>
                            
                            <button 
                              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-slate-100 w-full text-left"
                              onClick={() => handleDeletePost(post._id)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {editingPostId === post._id ? (
                <div className="pl-14">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none mb-4"
                    placeholder="Edit your reply..."
                    disabled={submitting}
                  ></textarea>
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={cancelEditPost}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleEditPost(post._id)}
                      disabled={submitting || !editContent.trim()}
                      loading={submitting}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="prose max-w-none text-slate-700 whitespace-pre-line pl-14 mb-4">
                    {post.content}
                  </div>
                  
                  <div className="flex justify-end gap-4 pl-14">
                    <button
                      onClick={() => handleLikePost(post._id)}
                      className={`flex items-center text-sm ${
                        post.userLiked ? 'text-red-500' : 'text-slate-500 hover:text-red-500'
                      } transition-colors`}
                      aria-label={post.userLiked ? "Unlike" : "Like"}
                    >
                      {post.userLiked ? <FaHeart className="mr-1" /> : <FaRegHeart className="mr-1" />}
                      {post.likeCount || 0}
                    </button>
                    
                    <button
                      onClick={() => {
                        setReplyContent(`@${post.author.firstName} ${post.author.lastName} `);
                        if (replyRef.current) {
                          replyRef.current.focus();
                        }
                      }}
                      className="flex items-center text-sm text-slate-500 hover:text-yellow-500 transition-colors"
                      aria-label="Reply"
                    >
                      <FaReply className="mr-1" />
                      Reply
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Reply Form */}
      {discussion.status !== 'locked' ? (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Post a Reply</h3>
          
          <textarea
            ref={replyRef}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows={6}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none mb-4"
            placeholder="Share your thoughts or questions..."
            disabled={submitting}
          ></textarea>
          
          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={handlePostReply}
              disabled={!replyContent.trim() || submitting}
              loading={submitting}
            >
              Post Reply
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md border border-yellow-200">
          <h3 className="font-medium flex items-center">
            <FaLock className="mr-2" />
            This discussion is locked.
          </h3>
          <p>New replies are no longer accepted.</p>
        </div>
      )}
    </div>
  );
};

export default DiscussionPage;