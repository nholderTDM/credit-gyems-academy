import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

// Components
import Loader from '../components/common/Loader';
import ErrorDisplay from '../components/common/ErrorDisplay';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import Pagination from '../components/common/Pagination';
import { FaPlus, FaSearch, FaFilter, FaEye, FaComment, FaThumbtack, FaLock } from 'react-icons/fa';

const DiscussionListPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Use currentUser instead of token
  
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters and pagination
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
  });

  // Category options
  const categories = [
    { value: 'all', label: 'All Categories', color: '#0A2342' },
    { value: 'general', label: 'General Discussion', color: '#FFD700' },
    { value: 'credit_repair', label: 'Credit Repair', color: '#FF0000' },
    { value: 'credit_coaching', label: 'Credit Coaching', color: '#26A69A' },
    { value: 'financial_planning', label: 'Financial Planning', color: '#0A2342' },
    { value: 'success_stories', label: 'Success Stories', color: '#E8E8E8' }
  ];
  
  // Sort options
  const sortOptions = [
    { value: 'latest', label: 'Latest' },
    { value: 'popular', label: 'Most Popular' }
  ];

  // Fetch discussions with filters
  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        setLoading(true);
        
        // For now, use mock data since API might not be ready
        // Replace this with actual API call when backend is ready
        const mockDiscussions = [
          {
            _id: '1',
            title: 'How I improved my credit score by 150 points',
            category: 'success_stories',
            author: {
              firstName: 'Sarah',
              lastName: 'Johnson',
              profileImage: null
            },
            content: 'I wanted to share my journey...',
            postCount: 12,
            viewCount: 234,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            lastPost: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            isPinned: true,
            status: 'published'
          },
          {
            _id: '2',
            title: 'Best practices for dispute letters',
            category: 'credit_repair',
            author: {
              firstName: 'Mike',
              lastName: 'Davis',
              profileImage: null
            },
            content: 'Here are some tips I learned...',
            postCount: 8,
            viewCount: 156,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            lastPost: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            isPinned: false,
            status: 'published'
          },
          {
            _id: '3',
            title: 'Questions about credit coaching program',
            category: 'credit_coaching',
            author: {
              firstName: 'Lisa',
              lastName: 'Chen',
              profileImage: null
            },
            content: 'I am considering signing up...',
            postCount: 5,
            viewCount: 89,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            lastPost: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            isPinned: false,
            status: 'locked'
          }
        ];
        
        // Filter by category
        let filteredDiscussions = mockDiscussions;
        if (category !== 'all') {
          filteredDiscussions = filteredDiscussions.filter(d => d.category === category);
        }
        
        // Filter by search query
        if (searchQuery) {
          filteredDiscussions = filteredDiscussions.filter(d => 
            d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.content.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        // Sort discussions
        if (sortBy === 'popular') {
          filteredDiscussions.sort((a, b) => b.viewCount - a.viewCount);
        } else {
          filteredDiscussions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        
        setDiscussions(filteredDiscussions);
        setPagination({
          total: filteredDiscussions.length,
          page: 1,
          limit: 10,
          pages: Math.ceil(filteredDiscussions.length / 10)
        });
        
        // Uncomment when API is ready:
        // let url = `/api/community/discussions?page=${page}&sort=${sortBy}`;
        // if (category !== 'all') {
        //   url += `&category=${category}`;
        // }
        // if (searchQuery) {
        //   url += `&search=${encodeURIComponent(searchQuery)}`;
        // }
        // const response = await axios.get(url, {
        //   headers: {
        //     Authorization: `Bearer ${token}`
        //   }
        // });
        // setDiscussions(response.data?.data?.discussions || []);
        // setPagination(response.data?.data?.pagination || {
        //   total: 0,
        //   page: 1,
        //   limit: 10,
        //   pages: 1
        // });
        
      } catch (err) {
        console.error('Error fetching discussions:', err);
        setError('Failed to load discussions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDiscussions();
  }, [category, sortBy, searchQuery, page]);

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  // Get category details
  const getCategoryDetails = (categoryValue) => {
    return categories.find(cat => cat.value === categoryValue) || { value: categoryValue, label: categoryValue, color: '#FFD700' };
  };

  // Navigate to new discussion form
  const handleNewDiscussion = () => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/community/new-discussion' } });
      return;
    }
    navigate('/discussions/new');
  };

  if (loading && page === 1) {
    return <Loader />;
  }

  if (error && discussions.length === 0) {
    return (
      <ErrorDisplay 
        message={error}
        actionText="Try Again"
        onAction={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-4 md:mb-0">Community Discussions</h1>
        
        <Button
          variant="primary"
          onClick={handleNewDiscussion}
          icon={<FaPlus />}
        >
          Start New Discussion
        </Button>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {/* Search Bar */}
          <div className="flex-grow">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search discussions..."
                className="w-full px-4 py-2 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
              <FaSearch className="absolute left-3 top-3 text-slate-400" />
              <button type="submit" className="hidden">Search</button>
            </form>
          </div>
          
          {/* Category Filter */}
          <div className="flex items-center">
            <FaFilter className="text-slate-400 mr-2" />
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1); // Reset to page 1 when changing category
              }}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Sort Dropdown */}
          <div className="flex items-center">
            <span className="text-slate-400 mr-2">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1); // Reset to page 1 when changing sort
              }}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Discussions */}
      {discussions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-slate-100">
          <p className="text-slate-600 mb-4">No discussions found in this category.</p>
          <Button
            variant="primary"
            onClick={handleNewDiscussion}
          >
            Start the First Discussion
          </Button>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {discussions.map(discussion => {
            const categoryDetails = getCategoryDetails(discussion.category);
            const authorFirstName = discussion.author?.firstName || 'Unknown';
            const authorLastName = discussion.author?.lastName || 'User';
            
            return (
              <div 
                key={discussion._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md p-5 border border-slate-100 transition-shadow"
              >
                <Link to={`/discussions/${discussion._id}`} className="block">
                  <div className="flex items-start gap-4">
                    <Avatar 
                      name={`${authorFirstName} ${authorLastName}`}
                      image={discussion.author?.profileImage}
                      size="md"
                    />
                    
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-800 hover:text-yellow-500 transition-colors">
                          {discussion.title}
                        </h2>
                        
                        {discussion.isPinned && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                            <FaThumbtack className="mr-1" size={10} /> Pinned
                          </span>
                        )}
                        
                        {discussion.status === 'locked' && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            <FaLock className="mr-1" size={10} /> Locked
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center text-sm text-slate-500 mt-1 mb-2">
                        <span className="mr-2">By {authorFirstName} {authorLastName}</span>
                        <span className="mr-2">•</span>
                        <span className="mr-2" title={discussion.createdAt ? new Date(discussion.createdAt).toLocaleString() : ''}>
                          {discussion.createdAt ? formatRelativeTime(discussion.createdAt) : 'Unknown time'}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <span 
                          className="px-2.5 py-0.5 text-xs font-medium rounded-full"
                          style={{ backgroundColor: `${categoryDetails.color}20`, color: categoryDetails.color }}
                        >
                          {categoryDetails.label}
                        </span>
                        
                        <span className="px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-full flex items-center">
                          <FaComment className="mr-1" size={10} />
                          {discussion.postCount || 0}
                        </span>
                        
                        <span className="px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-full flex items-center">
                          <FaEye className="mr-1" size={10} />
                          {discussion.viewCount || 0}
                        </span>
                      </div>
                    </div>
                    
                    {discussion.lastPost && (
                      <div className="hidden md:block text-right text-sm text-slate-500">
                        <p>Last reply</p>
                        <p title={new Date(discussion.lastPost).toLocaleString()}>
                          {formatRelativeTime(discussion.lastPost)}
                        </p>
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Pagination */}
      {pagination.pages > 1 && (
        <Pagination 
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default DiscussionListPage;