import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const CommunityPage = () => {
  const { token } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 0 });
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    const sortParam = params.get('sort');
    const pageParam = params.get('page');
    
    if (categoryParam) setCategory(categoryParam);
    if (sortParam) setSortBy(sortParam);
    if (pageParam) setPagination(prev => ({ ...prev, page: parseInt(pageParam) }));
  }, [location.search]);
  
  // Fetch discussions
  useEffect(() => {
    const fetchDiscussions = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        setError('');
        
        let url = `/api/community/discussions?page=${pagination.page}&sort=${sortBy}`;
        
        if (category !== 'all') {
          url += `&category=${category}`;
        }
        
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setDiscussions(response.data.data.discussions);
        setPagination(response.data.data.pagination);
      } catch (err) {
        console.error('Error fetching discussions:', err);
        setError('Failed to load discussions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDiscussions();
  }, [token, category, sortBy, pagination.page]);
  
  // Handle category change
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    navigate(`/community?category=${newCategory}&sort=${sortBy}`);
  };
  
  // Handle sort change
  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    navigate(`/community?category=${category}&sort=${newSort}`);
  };
  
  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
    navigate(`/community?category=${category}&sort=${sortBy}&page=${newPage}`);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // If it's today
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // If it's yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Otherwise, show the date
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <div className="py-20 flex-grow">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-4 md:mb-0">Community Forum</h1>
            
            <Link 
              to="/community/new"
              className="bg-gradient-to-r from-primary to-primary-light text-slate-800 font-semibold px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-all"
            >
              Start New Discussion
            </Link>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-slate-700 mr-2">Category:</span>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    <option value="credit_repair">Credit Repair</option>
                    <option value="credit_coaching">Credit Coaching</option>
                    <option value="financial_planning">Financial Planning</option>
                    <option value="general">General Discussion</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <span className="text-sm font-medium text-slate-700 mr-2">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="latest">Latest</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <div className="text-red-500 mb-4">{error}</div>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-primary hover:bg-primary-dark text-slate-800 px-6 py-2 rounded-full"
                >
                  Try Again
                </button>
              </div>
            ) : discussions.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-slate-600 mb-6">No discussions found in this category.</p>
                <Link
                  to="/community/new"
                  className="bg-gradient-to-r from-primary to-primary-light text-slate-800 font-semibold px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  Start the First Discussion
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {discussions.map((discussion) => (
                  <div 
                    key={discussion._id}
                    className="p-6 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex md:items-center flex-col md:flex-row gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-lg font-semibold">
                          {discussion.author.firstName.charAt(0)}{discussion.author.lastName.charAt(0)}
                        </div>
                      </div>
                      
                      <div className="flex-grow">
                        <Link 
                          to={`/community/discussions/${discussion._id}`}
                          className="text-lg font-bold text-slate-800 hover:text-primary transition-colors"
                        >
                          {discussion.isPinned && (
                            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full mr-2">
                              Pinned
                            </span>
                          )}
                          {discussion.title}
                        </Link>
                        
                        <div className="text-sm text-slate-500 mt-1">
                          Posted by {discussion.author.firstName} {discussion.author.lastName} • {formatDate(discussion.createdAt)}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-full flex items-center">
                            {discussion.category.replace('_', ' ')}
                          </span>
                          
                          <span className="px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-full flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {discussion.postCount}
                          </span>
                          
                          <span className="px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-full flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {discussion.viewCount}
                          </span>
                        </div>
                      </div>
                      
                      {discussion.lastPost && (
                        <div className="hidden md:block text-right text-sm text-slate-500">
                          <p>Last reply</p>
                          <p>{formatDate(discussion.lastPost)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center p-4 border-t border-slate-100">
                <div className="flex space-x-1">
                  <button
                    onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 rounded-md border border-slate-300 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-md ${
                        pageNum === pagination.page 
                          ? 'bg-primary text-slate-800' 
                          : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(Math.min(pagination.pages, pagination.page + 1))}
                    disabled={pagination.page === pagination.pages}
                    className="px-4 py-2 rounded-md border border-slate-300 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CommunityPage;