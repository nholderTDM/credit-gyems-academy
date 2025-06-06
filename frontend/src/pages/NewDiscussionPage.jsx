import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const NewDiscussionPage = () => {
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setError('You must be logged in to create a discussion');
      return;
    }
    
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post(
        `/api/community/discussions`,
        { title, content, category },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      navigate(`/community/discussions/${response.data.data._id}`);
    } catch (err) {
      console.error('Error creating discussion:', err);
      setError('Failed to create discussion. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <div className="py-20 flex-grow">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center mb-6">
              <Link 
                to="/community"
                className="text-primary hover:text-primary-dark flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Community
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h1 className="text-2xl font-bold text-slate-800">Create New Discussion</h1>
                <p className="text-slate-600">Share your thoughts or questions with the community</p>
              </div>
              
              <div className="p-6">
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter a descriptive title for your discussion"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
                      Category *
                    </label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="general">General Discussion</option>
                      <option value="credit_repair">Credit Repair</option>
                      <option value="credit_coaching">Credit Coaching</option>
                      <option value="financial_planning">Financial Planning</option>
                    </select>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-1">
                      Content *
                    </label>
                    <textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={8}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Share your thoughts, questions, or experiences..."
                      required
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end">
                    <Link
                      to="/community"
                      className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors mr-2"
                    >
                      Cancel
                    </Link>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-gradient-to-r from-primary to-primary-light text-slate-800 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70"
                    >
                      {loading ? 'Creating...' : 'Create Discussion'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default NewDiscussionPage;