import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

// Components
import Loader from '../components/common/Loader';
import ErrorDisplay from '../components/common/ErrorDisplay';
import Button from '../components/common/Button';
import { FaArrowLeft } from 'react-icons/fa';

const DiscussionFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general'
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Categories for selection
  const categories = [
    { value: 'general', label: 'General Discussion', color: '#FFD700' },
    { value: 'credit_repair', label: 'Credit Repair', color: '#FF0000' },
    { value: 'credit_coaching', label: 'Credit Coaching', color: '#26A69A' },
    { value: 'financial_planning', label: 'Financial Planning', color: '#0A2342' },
    { value: 'success_stories', label: 'Success Stories', color: '#E8E8E8' }
  ];

  // If in edit mode, fetch discussion data
  useEffect(() => {
    const fetchDiscussion = async () => {
      if (!isEditMode) return;
      
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
        
        const discussion = response.data.data.discussion;
        
        setFormData({
          title: discussion.title,
          content: discussion.content,
          category: discussion.category
        });
      } catch (err) {
        console.error('Error fetching discussion:', err);
        setError('Failed to load discussion. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (token && isEditMode) {
      fetchDiscussion();
    }
  }, [id, token, isEditMode]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit the form (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required.');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      let response;
      
      if (isEditMode) {
        // Update existing discussion
        response = await axios.put(
          `/api/community/discussions/${id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        toast.success('Discussion updated successfully!');
      } else {
        // Create new discussion
        response = await axios.post(
          `/api/community/discussions`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        toast.success('Discussion created successfully!');
      }
      
      // Navigate to the discussion page
      navigate(`/community/discussions/${response.data.data._id}`);
    } catch (err) {
      console.error('Error submitting discussion:', err);
      toast.error(isEditMode ? 'Failed to update discussion.' : 'Failed to create discussion.');
      setError('An error occurred. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error && isEditMode) {
    return (
      <ErrorDisplay 
        message={error}
        actionText="Back to Community"
        onAction={() => navigate('/community')}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-yellow-500 hover:text-yellow-600 font-medium mb-6 transition-colors"
      >
        <FaArrowLeft className="mr-2" />
        Back
      </button>
      
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-slate-100">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">
          {isEditMode ? 'Edit Discussion' : 'Start a New Discussion'}
        </h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              placeholder="Enter a descriptive title for your discussion"
              required
              disabled={submitting}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              required
              disabled={submitting}
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-8">
            <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-1">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={10}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-y"
              placeholder="Share your thoughts, questions, or experiences in detail..."
              required
              disabled={submitting}
            ></textarea>
            <p className="text-sm text-slate-500 mt-2">
              Tip: Be clear and descriptive to get better responses from the community.
            </p>
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button
              variant="secondary"
              onClick={() => navigate('/community')}
              disabled={submitting}
            >
              Cancel
            </Button>
            
            <Button
              variant="primary"
              type="submit"
              disabled={submitting || !formData.title.trim() || !formData.content.trim()}
              loading={submitting}
            >
              {isEditMode ? 'Update Discussion' : 'Post Discussion'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiscussionFormPage;