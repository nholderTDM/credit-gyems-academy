import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search,
  Calendar,
  Clock,
  User,
  Tag,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  TrendingUp,
  Filter,
  X,
  Loader2,
  FileText,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Star,
  Award,
  Zap,
  Shield,
  DollarSign,
  Home,
  CreditCard,
  Target,
  BarChart3
} from 'lucide-react';

const BlogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const postsPerPage = 9;

  // Featured posts
  const [featuredPosts, setFeaturedPosts] = useState([]);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        // Simulated blog posts data
        const demoPosts = [
          {
            id: 1,
            title: "7 Steps to Rebuild Your Credit After Bankruptcy",
            slug: "rebuild-credit-after-bankruptcy",
            excerpt: "Bankruptcy doesn't have to be the end of your financial story. Learn proven strategies to rebuild your credit score and regain financial stability.",
            content: "Full article content here...",
            author: {
              name: "DorTae Freeman",
              avatar: null,
              role: "Credit Expert"
            },
            category: "Credit Repair",
            tags: ["bankruptcy", "credit repair", "financial recovery"],
            image: null,
            readTime: 8,
            publishedAt: new Date('2024-01-15'),
            views: 3542,
            likes: 189,
            comments: 42,
            featured: true
          },
          {
            id: 2,
            title: "Understanding Your Credit Report: A Complete Guide",
            slug: "understanding-credit-report-guide",
            excerpt: "Your credit report is the foundation of your financial health. This comprehensive guide breaks down everything you need to know.",
            content: "Full article content here...",
            author: {
              name: "Sarah Johnson",
              avatar: null,
              role: "Credit Analyst"
            },
            category: "Credit Education",
            tags: ["credit report", "credit score", "financial literacy"],
            image: null,
            readTime: 12,
            publishedAt: new Date('2024-01-10'),
            views: 5234,
            likes: 267,
            comments: 78,
            featured: true
          },
          {
            id: 3,
            title: "How to Remove Collections from Your Credit Report",
            slug: "remove-collections-credit-report",
            excerpt: "Collections accounts can devastate your credit score. Here's a step-by-step guide to removing them legally and effectively.",
            content: "Full article content here...",
            author: {
              name: "Michael Chen",
              avatar: null,
              role: "Financial Advisor"
            },
            category: "Credit Repair",
            tags: ["collections", "credit repair", "dispute process"],
            image: null,
            readTime: 10,
            publishedAt: new Date('2024-01-08'),
            views: 4123,
            likes: 198,
            comments: 56,
            featured: false
          },
          {
            id: 4,
            title: "Building Wealth: Investment Strategies for Beginners",
            slug: "investment-strategies-beginners",
            excerpt: "Start your wealth-building journey with these proven investment strategies designed for beginners.",
            content: "Full article content here...",
            author: {
              name: "Jessica Williams",
              avatar: null,
              role: "Investment Specialist"
            },
            category: "Wealth Building",
            tags: ["investing", "wealth building", "financial planning"],
            image: null,
            readTime: 15,
            publishedAt: new Date('2024-01-05'),
            views: 2890,
            likes: 145,
            comments: 34,
            featured: false
          },
          {
            id: 5,
            title: "First-Time Homebuyer's Credit Guide",
            slug: "first-time-homebuyer-credit-guide",
            excerpt: "Preparing to buy your first home? Learn how to optimize your credit score for the best mortgage rates.",
            content: "Full article content here...",
            author: {
              name: "DorTae Freeman",
              avatar: null,
              role: "Credit Expert"
            },
            category: "Home Buying",
            tags: ["home buying", "mortgage", "credit score"],
            image: null,
            readTime: 11,
            publishedAt: new Date('2024-01-03'),
            views: 3678,
            likes: 212,
            comments: 67,
            featured: false
          },
          {
            id: 6,
            title: "Debt Snowball vs. Debt Avalanche: Which is Right for You?",
            slug: "debt-snowball-vs-avalanche",
            excerpt: "Compare two popular debt repayment strategies and find out which one will help you become debt-free faster.",
            content: "Full article content here...",
            author: {
              name: "Sarah Johnson",
              avatar: null,
              role: "Credit Analyst"
            },
            category: "Debt Management",
            tags: ["debt", "financial strategies", "budgeting"],
            image: null,
            readTime: 9,
            publishedAt: new Date('2023-12-28'),
            views: 2456,
            likes: 134,
            comments: 45,
            featured: false
          }
        ];
        
        setPosts(demoPosts);
        setFeaturedPosts(demoPosts.filter(post => post.featured));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      // Simulated categories
      const demoCategories = [
        { id: 1, name: "Credit Repair", slug: "credit-repair", count: 24, icon: Shield },
        { id: 2, name: "Credit Education", slug: "credit-education", count: 18, icon: BookOpen },
        { id: 3, name: "Wealth Building", slug: "wealth-building", count: 15, icon: TrendingUp },
        { id: 4, name: "Debt Management", slug: "debt-management", count: 12, icon: Target },
        { id: 5, name: "Home Buying", slug: "home-buying", count: 8, icon: Home },
        { id: 6, name: "Financial Planning", slug: "financial-planning", count: 10, icon: BarChart3 }
      ];
      setCategories(demoCategories);
    };

    fetchBlogPosts();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [filterPosts]);

  useEffect(() => {
    // Update URL params
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    setSearchParams(params);
  }, [searchQuery, selectedCategory, setSearchParams]);


  const filterPosts = useCallback(() => {
    let filtered = [...posts];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => 
        post.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory
      );
    }

    setFilteredPosts(filtered);
    setCurrentPage(1);
  }, [posts, searchQuery, selectedCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    // filterPosts is called automatically via useEffect when searchQuery changes
  };

  // Pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCategoryIcon = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.icon : FileText;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#FFD700] mx-auto" />
          <p className="mt-4 text-gray-600">Loading articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Credit & Finance
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FF0000]">
                Knowledge Hub
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Expert insights, tips, and strategies to improve your credit score and build lasting wealth
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, topics, or tags..."
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-[#FFD700] to-[#FF0000] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>
          
          <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`p-4 rounded-lg text-center transition-all ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-[#FFD700] to-[#FF0000] text-white shadow-lg'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <FileText className="h-6 w-6 mx-auto mb-2" />
              <span className="block font-medium">All Posts</span>
              <span className="text-sm opacity-75">{posts.length}</span>
            </button>
            
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`p-4 rounded-lg text-center transition-all ${
                    selectedCategory === category.slug
                      ? 'bg-gradient-to-r from-[#FFD700] to-[#FF0000] text-white shadow-lg'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <Icon className="h-6 w-6 mx-auto mb-2" />
                  <span className="block font-medium">{category.name}</span>
                  <span className="text-sm opacity-75">{category.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && selectedCategory === 'all' && !searchQuery && (
        <section className="py-12 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center mb-8">
              <Star className="h-6 w-6 text-[#FFD700] mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Featured Articles</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {featuredPosts.map((post) => {
                const CategoryIcon = getCategoryIcon(post.category);
                return (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all"
                  >
                    <div className="p-8">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-10 w-10 bg-gradient-to-r from-[#FFD700] to-[#FF0000] rounded-lg flex items-center justify-center">
                          <CategoryIcon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-[#FF0000]">{post.category}</span>
                        <span className="text-sm text-gray-500">
                          {post.readTime} min read
                        </span>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#FF0000] transition-colors">
                        {post.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(post.publishedAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Heart className="h-4 w-4 mr-1" />
                            {post.likes}
                          </span>
                          <span className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {post.comments}
                          </span>
                        </div>
                        
                        <ArrowRight className="h-5 w-5 text-[#FFD700] group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {currentPosts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FF0000] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {currentPosts.map((post) => {
                  const CategoryIcon = getCategoryIcon(post.category);
                  return (
                    <article key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
                      {post.image ? (
                        <div className="h-48 bg-gray-200">
                          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <CategoryIcon className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="inline-flex items-center px-3 py-1 bg-[#FFD700]/10 text-[#FF0000] text-sm font-medium rounded-full">
                            {post.category}
                          </span>
                          <span className="text-sm text-gray-500">{post.readTime} min read</span>
                        </div>
                        
                        <Link to={`/blog/${post.slug}`}>
                          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#FF0000] transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                        </Link>
                        
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-gray-300 rounded-full mr-3"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{post.author.name}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(post.publishedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <Link
                            to={`/blog/${post.slug}`}
                            className="text-[#FFD700] hover:text-[#FF0000] transition-colors"
                          >
                            <ArrowRight className="h-5 w-5" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => paginate(index + 1)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        currentPage === index + 1
                          ? 'bg-gradient-to-r from-[#FFD700] to-[#FF0000] text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-[#FFD700] to-[#FF0000] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Zap className="h-12 w-12 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">
            Get Credit Tips Delivered to Your Inbox
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join 10,000+ subscribers getting weekly insights on credit improvement and wealth building
          </p>
          
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-3 bg-white/20 backdrop-blur border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Subscribe
            </button>
          </form>
          
          <p className="text-sm mt-4 opacity-75">
            No spam, unsubscribe anytime. Read our privacy policy.
          </p>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;