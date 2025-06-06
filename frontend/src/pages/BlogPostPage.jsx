import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Tag,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  Check,
  ChevronRight,
  Quote,
  AlertCircle,
  Loader2,
  ThumbsUp,
  Reply,
  MoreVertical,
  Send,
  Star,
  TrendingUp,
  BookOpen
} from 'lucide-react';

const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    fetchBlogPost();
    window.scrollTo(0, 0);
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBlogPost = async () => {
    try {
      setLoading(true);
      
      // Simulated blog post data
      const demoPost = {
        id: 1,
        title: "7 Steps to Rebuild Your Credit After Bankruptcy",
        slug: "rebuild-credit-after-bankruptcy",
        content: `
          <p>Filing for bankruptcy can feel like hitting rock bottom financially, but it's important to remember that it's not the end of your financial journey – it's a new beginning. With the right strategies and dedication, you can rebuild your credit and achieve financial stability faster than you might think.</p>

          <h2>Understanding the Impact of Bankruptcy on Your Credit</h2>
          <p>Before diving into the rebuilding process, it's crucial to understand how bankruptcy affects your credit score. A bankruptcy filing can lower your credit score by 130 to 240 points, depending on your score before filing. Chapter 7 bankruptcy remains on your credit report for 10 years, while Chapter 13 stays for 7 years.</p>

          <blockquote>
            <p>"Bankruptcy isn't a financial death sentence – it's a legal tool designed to give people a fresh start. The key is learning from past mistakes and building better financial habits moving forward."</p>
            <cite>- DorTae Freeman, Credit Expert</cite>
          </blockquote>

          <h2>Step 1: Review Your Credit Reports Thoroughly</h2>
          <p>The first step in rebuilding your credit is knowing exactly where you stand. Order free copies of your credit reports from all three major credit bureaus: Experian, Equifax, and TransUnion. Review each report carefully for:</p>
          <ul>
            <li>Accuracy of the bankruptcy filing information</li>
            <li>Accounts that should have been included in the bankruptcy</li>
            <li>Any errors or outdated information</li>
            <li>Accounts that are still reporting as delinquent when they should show "included in bankruptcy"</li>
          </ul>

          <h2>Step 2: Create a Solid Budget and Emergency Fund</h2>
          <p>One of the most important steps in rebuilding your financial life is creating a realistic budget that you can stick to. This will help you:</p>
          <ul>
            <li>Avoid falling back into debt</li>
            <li>Build an emergency fund for unexpected expenses</li>
            <li>Ensure all bills are paid on time moving forward</li>
            <li>Identify areas where you can save money</li>
          </ul>

          <p>Aim to save at least $1,000 as a starter emergency fund, then work toward 3-6 months of living expenses.</p>

          <h2>Step 3: Consider a Secured Credit Card</h2>
          <p>A secured credit card is one of the best tools for rebuilding credit after bankruptcy. These cards require a security deposit that typically becomes your credit limit. Look for cards that:</p>
          <ul>
            <li>Report to all three credit bureaus</li>
            <li>Have low annual fees</li>
            <li>Offer a path to upgrade to an unsecured card</li>
            <li>Don't charge excessive fees</li>
          </ul>

          <h2>Step 4: Become an Authorized User</h2>
          <p>If you have a trusted family member or friend with good credit, ask if they'll add you as an authorized user on one of their credit cards. This can help you benefit from their positive payment history and low credit utilization.</p>

          <h2>Step 5: Apply for a Credit Builder Loan</h2>
          <p>Credit builder loans are specifically designed to help people build or rebuild credit. These loans work differently than traditional loans – the money you borrow is held in a savings account while you make payments. Once the loan is paid off, you receive the funds.</p>

          <h2>Step 6: Pay Everything on Time, Every Time</h2>
          <p>Payment history makes up 35% of your credit score, making it the most important factor. Set up automatic payments or reminders to ensure you never miss a due date. Even one late payment can significantly set back your credit rebuilding efforts.</p>

          <h2>Step 7: Monitor Your Progress and Be Patient</h2>
          <p>Rebuilding credit takes time and patience. Monitor your credit score monthly to track your progress, but don't get discouraged if you don't see immediate results. Most people see significant improvement within 12-24 months of consistent positive credit behavior.</p>

          <h2>Additional Tips for Success</h2>
          <ul>
            <li><strong>Keep credit utilization low:</strong> Try to use less than 30% of your available credit, ideally under 10%</li>
            <li><strong>Don't close old accounts:</strong> Length of credit history matters, so keep accounts open if possible</li>
            <li><strong>Diversify your credit mix:</strong> Having different types of credit (cards, loans) can help your score</li>
            <li><strong>Avoid credit repair scams:</strong> Be wary of companies promising to "fix" your credit overnight</li>
          </ul>

          <h2>The Road Ahead</h2>
          <p>Remember, bankruptcy is not a reflection of your worth or your future potential. Many successful people have filed for bankruptcy and gone on to achieve financial success. The key is to learn from the experience, develop better financial habits, and stay committed to your rebuilding plan.</p>

          <p>With patience, discipline, and the right strategies, you can rebuild your credit and create a stronger financial foundation than ever before. The journey may be challenging, but the destination – financial freedom and peace of mind – is worth every step.</p>
        `,
        excerpt: "Bankruptcy doesn't have to be the end of your financial story. Learn proven strategies to rebuild your credit score and regain financial stability.",
        author: {
          name: "DorTae Freeman",
          avatar: null,
          role: "Founder & Credit Expert",
          bio: "With over 15 years of experience in credit repair and financial services, DorTae has helped thousands of clients transform their credit and achieve financial freedom."
        },
        category: "Credit Repair",
        tags: ["bankruptcy", "credit repair", "financial recovery", "credit building"],
        image: null,
        readTime: 8,
        publishedAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        views: 3542,
        likes: 189,
        featured: true
      };

      setPost(demoPost);

      // Fetch related posts
      fetchRelatedPosts(demoPost.category, demoPost.id);
      
      // Fetch comments
      fetchComments(demoPost.id);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching blog post:', error);
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async (category, currentPostId) => {
    try {
      // In a real app, this would fetch posts from the same category excluding current post
      // const response = await fetch(`/api/posts/related?category=${category}&exclude=${currentPostId}`);
      
      // Simulated related posts filtered by category
      const demoRelated = [
        {
          id: 2,
          title: "Understanding Your Credit Report: A Complete Guide",
          slug: "understanding-credit-report-guide",
          excerpt: "Your credit report is the foundation of your financial health.",
          category: "Credit Education",
          readTime: 12,
          publishedAt: new Date('2024-01-10')
        },
        {
          id: 3,
          title: "How to Remove Collections from Your Credit Report",
          slug: "remove-collections-credit-report",
          excerpt: "Step-by-step guide to removing collections legally.",
          category: "Credit Repair",
          readTime: 10,
          publishedAt: new Date('2024-01-08')
        },
        {
          id: 4,
          title: "Building an Emergency Fund After Financial Hardship",
          slug: "building-emergency-fund",
          excerpt: "Protect yourself from future financial setbacks.",
          category: "Financial Planning",
          readTime: 7,
          publishedAt: new Date('2024-01-05')
        }
      ].filter(post => 
        post.id !== currentPostId && 
        (category === 'Credit Repair' ? post.category === category : true)
      );
      
      setRelatedPosts(demoRelated);
    } catch (error) {
      console.error('Error fetching related posts:', error);
    }
  };

  const fetchComments = async (postId) => {
    try {
      // In a real app, this would fetch comments for the specific post
      // const response = await fetch(`/api/posts/${postId}/comments`);
      
      // Simulated comments for this specific post
      const demoComments = postId === 1 ? [
        {
          id: 1,
          author: {
            name: "John Smith",
            avatar: null
          },
          content: "This article was incredibly helpful! I filed for Chapter 7 last year and felt hopeless about my credit. Following these steps, I've already seen my score improve by 50 points in just 3 months.",
          createdAt: new Date('2024-01-16'),
          likes: 24,
          replies: [
            {
              id: 2,
              author: {
                name: "DorTae Freeman",
                avatar: null,
                isAuthor: true
              },
              content: "That's fantastic progress, John! Keep up the great work. Remember, consistency is key. If you need any specific guidance, don't hesitate to reach out.",
              createdAt: new Date('2024-01-16'),
              likes: 8
            }
          ]
        },
        {
          id: 3,
          author: {
            name: "Maria Garcia",
            avatar: null
          },
          content: "Thank you for not making bankruptcy sound like the end of the world. Your positive approach gives me hope that I can recover from this.",
          createdAt: new Date('2024-01-17'),
          likes: 15,
          replies: []
        }
      ] : [];
      
      setComments(demoComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleLike = () => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('authToken');
    if (!isAuthenticated) {
      navigate('/login?redirect=/blog/' + slug);
      return;
    }
    
    setIsLiked(!isLiked);
    // In a real app, this would update the backend
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // In a real app, this would save to user's bookmarks
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = post?.title || '';

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
        break;
      default:
        break;
    }
    setShowShareMenu(false);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    // Check if user is authenticated (in a real app)
    const isAuthenticated = localStorage.getItem('authToken');
    if (!isAuthenticated) {
      navigate('/login?redirect=/blog/' + slug);
      return;
    }

    setIsSubmittingComment(true);
    
    // Simulate API call
    setTimeout(() => {
      const comment = {
        id: Date.now(),
        author: {
          name: "Current User",
          avatar: null
        },
        content: newComment,
        createdAt: new Date(),
        likes: 0,
        replies: []
      };

      if (replyTo) {
        // Add as reply
        setComments(comments.map(c => {
          if (c.id === replyTo) {
            return { ...c, replies: [...c.replies, comment] };
          }
          return c;
        }));
        setReplyTo(null);
      } else {
        // Add as new comment
        setComments([comment, ...comments]);
      }

      setNewComment('');
      setIsSubmittingComment(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#FFD700] mx-auto" />
          <p className="mt-4 text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h2>
          <p className="text-gray-600 mb-6">The article you're looking for doesn't exist.</p>
          <Link
            to="/blog"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FF0000] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Article Header */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-[#FFD700]">Home</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link to="/blog" className="hover:text-[#FFD700]">Blog</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-gray-900">{post.category}</span>
        </nav>

        {/* Article Title and Meta */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center px-3 py-1 bg-[#FFD700]/10 text-[#FF0000] text-sm font-medium rounded-full">
              {post.category}
            </span>
            {post.featured && (
              <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </span>
            )}
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            {post.title}
          </h1>
          
          <p className="text-xl text-gray-600 mb-6">
            {post.excerpt}
          </p>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date(post.publishedAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              {post.readTime} min read
            </div>
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              {post.views.toLocaleString()} views
            </div>
          </div>
        </header>

        {/* Author Info */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 bg-gradient-to-r from-[#FFD700] to-[#FF0000] rounded-full flex items-center justify-center flex-shrink-0">
              {post.author.avatar ? (
                <img src={post.author.avatar} alt={post.author.name} className="h-16 w-16 rounded-full" />
              ) : (
                <User className="h-8 w-8 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
              <p className="text-sm text-[#FF0000] mb-2">{post.author.role}</p>
              <p className="text-sm text-gray-600">{post.author.bio}</p>
            </div>
          </div>
        </div>

        {/* Article Actions */}
        <div className="flex items-center justify-between py-6 border-b border-gray-200 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isLiked 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{post.likes + (isLiked ? 1 : 0)}</span>
            </button>
            
            <a
              href="#comments"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <MessageSquare className="h-5 w-5" />
              <span>{comments.length}</span>
            </a>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-lg transition-colors ${
                isBookmarked 
                  ? 'bg-[#FFD700]/20 text-[#FFD700]' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Share2 className="h-5 w-5" />
              </button>
              
              {showShareMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10">
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                  >
                    <Twitter className="h-4 w-4" />
                    Share on Twitter
                  </button>
                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                  >
                    <Facebook className="h-4 w-4" />
                    Share on Facebook
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                  >
                    <Linkedin className="h-4 w-4" />
                    Share on LinkedIn
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        Link Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Link
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div 
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        <div className="py-6 border-t border-gray-200">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="h-4 w-4 text-gray-500" />
            {post.tags.map((tag) => (
              <Link
                key={tag}
                to={`/blog?tag=${tag}`}
                className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-gray-200 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <section id="comments" className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Comments ({comments.length})
          </h2>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="bg-white rounded-xl p-6 mb-8 shadow-md">
            <div className="mb-4">
              {replyTo && (
                <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg mb-3">
                  <span className="text-sm text-gray-600">
                    Replying to comment...
                  </span>
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent resize-none"
                rows={4}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmittingComment}
                className="px-6 py-2 bg-gradient-to-r from-[#FFD700] to-[#FF0000] text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmittingComment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Post Comment
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-gray-300 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {comment.author.name}
                          {comment.author.isAuthor && (
                            <span className="ml-2 px-2 py-1 bg-[#FFD700]/20 text-[#FF0000] text-xs font-medium rounded">
                              Author
                            </span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{comment.content}</p>
                    
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{comment.likes}</span>
                      </button>
                      <button
                        onClick={() => setReplyTo(comment.id)}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                      >
                        <Reply className="h-4 w-4" />
                        Reply
                      </button>
                    </div>

                    {/* Replies */}
                    {comment.replies.length > 0 && (
                      <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-100">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start gap-3">
                            <div className="h-8 w-8 bg-gray-300 rounded-full flex-shrink-0"></div>
                            <div className="flex-1">
                              <div className="mb-1">
                                <span className="font-semibold text-gray-900 text-sm">
                                  {reply.author.name}
                                  {reply.author.isAuthor && (
                                    <span className="ml-2 px-2 py-0.5 bg-[#FFD700]/20 text-[#FF0000] text-xs font-medium rounded">
                                      Author
                                    </span>
                                  )}
                                </span>
                                <span className="text-xs text-gray-500 ml-2">
                                  {new Date(reply.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{reply.content}</p>
                              <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mt-1">
                                <ThumbsUp className="h-3 w-3" />
                                <span>{reply.likes}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Posts */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Articles</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {relatedPosts.map((relatedPost) => (
              <Link
                key={relatedPost.id}
                to={`/blog/${relatedPost.slug}`}
                className="group bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <BookOpen className="h-5 w-5 text-[#FFD700]" />
                  <span className="text-sm font-medium text-[#FF0000]">
                    {relatedPost.category}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#FF0000] transition-colors">
                  {relatedPost.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {relatedPost.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{relatedPost.readTime} min read</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-gradient-to-r from-[#FFD700] to-[#FF0000] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Get More Credit Tips & Insights
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join our newsletter for weekly articles on credit improvement and financial success
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
        </div>
      </section>
    </div>
  );
};

export default BlogPostPage;