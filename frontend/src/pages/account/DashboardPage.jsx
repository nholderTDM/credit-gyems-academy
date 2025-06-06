import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

// Components
import Loader from '../../components/common/Loader';
import ErrorDisplay from '../../components/common/ErrorDisplay';
import { 
  FaChartLine, 
  FaFileAlt, 
  FaShoppingBag, 
  FaCreditCard, 
  FaUserGraduate,
  FaArrowRight,
  FaUsers,
  FaBookmark
} from 'react-icons/fa';

const DashboardPage = () => {
  const { token, currentUser } = useAuth();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setDashboardData(response.data.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  // Calculate credit score color and label
  const getCreditScoreInfo = (score) => {
    if (score === null) return { color: 'gray', label: 'No Score' };
    
    if (score >= 750) return { color: '#10B981', label: 'Excellent' };
    if (score >= 700) return { color: '#22C55E', label: 'Good' };
    if (score >= 650) return { color: '#EAB308', label: 'Fair' };
    if (score >= 600) return { color: '#F97316', label: 'Poor' };
    return { color: '#EF4444', label: 'Very Poor' };
  };

  // Membership badge color
  const getMembershipColor = (status) => {
    switch (status) {
      case 'premium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'basic':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <ErrorDisplay 
        message={error}
        actionText="Try Again"
        onAction={() => window.location.reload()}
      />
    );
  }

  // If we don't have actual data from the API, create mock data
  const data = dashboardData || {
    orders: [],
    creditScore: currentUser?.creditScore || null,
    membershipStatus: currentUser?.membershipStatus || 'none',
    recentDiscussions: [],
    featuredProducts: []
  };

  const creditScoreInfo = getCreditScoreInfo(data.creditScore);
  const membershipColor = getMembershipColor(data.membershipStatus);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>
      
      {/* Welcome and Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Welcome Card */}
        <div className="col-span-2 bg-white rounded-xl shadow-md p-6 border border-slate-100">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500">
              <FaUserGraduate size={20} />
            </div>
            
            <div className="ml-4">
              <h2 className="text-lg font-bold text-slate-800">
                Welcome back, {currentUser?.firstName}!
              </h2>
              
              <p className="text-slate-600">
                {data.creditScore 
                  ? "Here's the latest on your credit journey" 
                  : "Let's start your credit transformation journey"}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Credit Score */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-500">Your Credit Score</span>
                
                <Link to="/account/profile" className="text-xs text-yellow-500 hover:text-yellow-600 flex items-center">
                  Update <FaArrowRight size={10} className="ml-1" />
                </Link>
              </div>
              
              {data.creditScore ? (
                <div className="flex items-center">
                  <div className="relative w-16 h-16 mr-3">
                    <svg viewBox="0 0 36 36" className="w-16 h-16 transform -rotate-90">
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="3"
                        strokeDasharray="100, 100"
                      />
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={creditScoreInfo.color}
                        strokeWidth="3"
                        strokeDasharray={`${(data.creditScore - 300) / 5.5}, 100`}
                      />
                    </svg>
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-sm font-bold" style={{ color: creditScoreInfo.color }}>
                      {data.creditScore}
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-bold text-slate-800">{creditScoreInfo.label}</div>
                    <div className="text-xs text-slate-500">Range: 300-850</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full border-4 border-slate-200 flex items-center justify-center mr-3">
                    <span className="text-sm font-bold text-slate-400">N/A</span>
                  </div>
                  
                  <div>
                    <div className="font-bold text-slate-800">Not Available</div>
                    <div className="text-xs text-slate-500">Complete your profile</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Membership Status */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-500">Membership</span>
                
                <Link to="/products" className="text-xs text-yellow-500 hover:text-yellow-600 flex items-center">
                  Upgrade <FaArrowRight size={10} className="ml-1" />
                </Link>
              </div>
              
              <div className="flex items-center">
                <div className={`rounded-full border px-3 py-1 text-sm font-medium mr-3 ${membershipColor}`}>
                  {data.membershipStatus === 'premium' 
                    ? 'Premium' 
                    : data.membershipStatus === 'basic' 
                      ? 'Basic' 
                      : 'Free'}
                </div>
                
                <div>
                  {data.membershipStatus === 'premium' ? (
                    <div className="text-sm text-slate-800">Full access to all features</div>
                  ) : data.membershipStatus === 'basic' ? (
                    <div className="text-sm text-slate-800">Basic access to courses</div>
                  ) : (
                    <div className="text-sm text-slate-800">Limited access</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h2>
          
          <div className="space-y-3">
            <Link 
              to="/products" 
              className="flex items-center p-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500 mr-3">
                <FaShoppingBag size={16} />
              </div>
              <span className="font-medium text-slate-700">Browse Products</span>
            </Link>
            
            <Link 
              to="/account/orders" 
              className="flex items-center p-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
                <FaFileAlt size={16} />
              </div>
              <span className="font-medium text-slate-700">View Orders</span>
            </Link>
            
            <Link 
              to="/community" 
              className="flex items-center p-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-3">
                <FaUsers size={16} />
              </div>
              <span className="font-medium text-slate-700">Join Community</span>
            </Link>
            
            <Link 
              to="/account/profile" 
              className="flex items-center p-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-500 mr-3">
                <FaCreditCard size={16} />
              </div>
              <span className="font-medium text-slate-700">Update Profile</span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-800">Recent Orders</h2>
          
          <Link 
            to="/account/orders" 
            className="text-sm text-yellow-500 hover:text-yellow-600 font-medium flex items-center"
          >
            View All <FaArrowRight className="ml-1" size={12} />
          </Link>
        </div>
        
        {data.orders && data.orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm font-medium text-slate-500 border-b border-slate-200">
                  <th className="pb-2 pl-4">Order #</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Total</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 pr-4">Action</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-100">
                {data.orders.slice(0, 5).map(order => (
                  <tr key={order._id} className="text-sm">
                    <td className="py-3 pl-4 font-medium text-slate-800">{order.orderNumber}</td>
                    <td className="py-3 text-slate-600">{formatDate(order.date)}</td>
                    <td className="py-3 font-medium text-slate-800">{formatCurrency(order.total)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.paymentStatus === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : order.paymentStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <Link 
                        to={`/order-confirmation/${order._id}`}
                        className="text-yellow-500 hover:text-yellow-600 font-medium"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <FaFileAlt className="text-slate-400" size={24} />
            </div>
            
            <p className="text-slate-600 mb-4">You don't have any orders yet.</p>
            
            <Link 
              to="/products"
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-full inline-flex items-center"
            >
              <FaShoppingBag className="mr-2" />
              Explore Products
            </Link>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Recent Community Activity */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Recent Discussions</h2>
            
            <Link 
              to="/community" 
              className="text-sm text-yellow-500 hover:text-yellow-600 font-medium flex items-center"
            >
              Join Community <FaArrowRight className="ml-1" size={12} />
            </Link>
          </div>
          
          {data.recentDiscussions && data.recentDiscussions.length > 0 ? (
            <div className="space-y-4">
              {data.recentDiscussions.map(discussion => (
                <Link 
                  key={discussion._id}
                  to={`/community/discussions/${discussion._id}`}
                  className="block p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mr-3">
                      <FaUsers size={14} />
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-slate-800 line-clamp-1">{discussion.title}</h3>
                      <p className="text-xs text-slate-500">Posted {formatDate(discussion.createdAt)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <FaUsers className="text-slate-400" size={20} />
              </div>
              
              <p className="text-slate-600 mb-3">No recent discussions.</p>
              
              <Link 
                to="/community"
                className="text-sm text-yellow-500 hover:text-yellow-600 font-medium"
              >
                Join the community
              </Link>
            </div>
          )}
        </div>
        
        {/* Featured Products */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Recommended for You</h2>
            
            <Link 
              to="/products" 
              className="text-sm text-yellow-500 hover:text-yellow-600 font-medium flex items-center"
            >
              View All <FaArrowRight className="ml-1" size={12} />
            </Link>
          </div>
          
          {data.featuredProducts && data.featuredProducts.length > 0 ? (
            <div className="space-y-4">
              {data.featuredProducts.slice(0, 3).map(product => (
                <Link 
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="flex items-center p-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="ml-3 flex-grow">
                    <h3 className="font-medium text-slate-800 line-clamp-1">{product.title}</h3>
                    
                    <div className="flex items-center mt-1">
                      {product.discountPrice ? (
                        <>
                          <span className="font-medium text-slate-800">{formatCurrency(product.discountPrice)}</span>
                          <span className="text-xs text-slate-500 line-through ml-2">{formatCurrency(product.price)}</span>
                        </>
                      ) : (
                        <span className="font-medium text-slate-800">{formatCurrency(product.price)}</span>
                      )}
                    </div>
                  </div>
                  
                  <FaBookmark className="text-yellow-500 ml-2" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <FaShoppingBag className="text-slate-400" size={20} />
              </div>
              
              <p className="text-slate-600 mb-3">No product recommendations yet.</p>
              
              <Link 
                to="/products"
                className="text-sm text-yellow-500 hover:text-yellow-600 font-medium"
              >
                Browse products
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Credit Journey */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-800">Your Credit Journey</h2>
          
          <Link 
            to="/account/profile" 
            className="text-sm text-yellow-500 hover:text-yellow-600 font-medium flex items-center"
          >
            Update Goals <FaArrowRight className="ml-1" size={12} />
          </Link>
        </div>
        
        <div className="p-4 bg-slate-50 rounded-lg flex flex-col md:flex-row items-center justify-between">
          <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
            <div className="text-sm text-slate-500 mb-1">Current Status</div>
            
            <div className="flex items-center">
              <FaChartLine className="text-yellow-500 mr-2" />
              
              {data.creditScore ? (
                <span className="font-bold text-slate-800">
                  {data.creditScore} - {creditScoreInfo.label}
                </span>
              ) : (
                <span className="font-bold text-slate-800">Not Available</span>
              )}
            </div>
          </div>
          
          <div className="hidden md:block border-r border-slate-300 h-12"></div>
          
          <div className="flex flex-col items-center md:items-start">
            <div className="text-sm text-slate-500 mb-1">Next Steps</div>
            
            <Link 
              to="/products"
              className="flex items-center font-medium text-yellow-500 hover:text-yellow-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Get personalized credit improvement plan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;