import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// Components
import Loader from '../components/common/Loader';
import ErrorDisplay from '../components/common/ErrorDisplay';
import Button from '../components/common/Button';
import Pagination from '../components/common/Pagination';
import { 
  FaFileAlt, 
  FaDownload, 
  FaShoppingBag,
  FaEye,
  FaSearch,
  FaFilter
} from 'react-icons/fa';

const MyOrdersPage = () => {
  const { token } = useAuth();
  
  const [ordersData, setOrdersData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' }
  ];

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        let url = `${import.meta.env.VITE_API_URL}/api/orders?page=${currentPage}`;
        
        if (statusFilter !== 'all') {
          url += `&status=${statusFilter}`;
        }
        
        if (searchQuery) {
          url += `&search=${searchQuery}`;
        }
        
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setOrdersData(response.data.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load your orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchOrders();
    }
  }, [token, statusFilter, searchQuery, currentPage]);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  if (loading && !ordersData) {
    return <Loader />;
  }

  if (error && !ordersData) {
    return (
      <ErrorDisplay 
        message={error}
        actionText="Try Again"
        onAction={() => window.location.reload()}
      />
    );
  }

  // Handle empty orders list
  if (ordersData && ordersData.orders.length === 0 && !searchQuery && statusFilter === 'all') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">My Orders</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-slate-100">
          <div className="w-20 h-20 mx-auto mb-6 text-slate-300">
            <FaFileAlt size={56} />
          </div>
          
          <h2 className="text-xl font-semibold text-slate-800 mb-2">You don't have any orders yet</h2>
          <p className="text-slate-600 mb-6">Start exploring our products and make your first purchase!</p>
          
          <Link to="/products">
            <Button variant="primary" icon={<FaShoppingBag />}>
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">My Orders</h1>
      
      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-grow">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders by number..."
                className="w-full px-4 py-2 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
              <FaSearch className="absolute left-3 top-3 text-slate-400" />
              <button type="submit" className="hidden">Search</button>
            </form>
          </div>
          
          {/* Status Filter */}
          <div className="flex items-center">
            <FaFilter className="text-slate-400 mr-2" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1); // Reset to page 1 when changing filter
              }}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Orders List */}
      {ordersData && ordersData.orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-slate-100">
          <p className="text-slate-600 mb-4">No orders found matching your filters.</p>
          <Button
            variant="secondary"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setCurrentPage(1);
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden mb-8">
          {/* Orders Table - Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left text-sm font-medium text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-6">Order #</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Items</th>
                  <th className="py-3 px-6">Total</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Actions</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-100">
                {ordersData && ordersData.orders.map(order => (
                  <tr key={order._id} className="text-sm hover:bg-slate-50">
                    <td className="py-4 px-6 font-medium text-slate-800">{order.orderNumber}</td>
                    <td className="py-4 px-6 text-slate-600">{formatDate(order.date)}</td>
                    <td className="py-4 px-6">
                      <div className="max-w-xs">
                        {order.items.slice(0, 2).map((item, index) => (
                          <div key={index} className="line-clamp-1 text-slate-600">
                            {item.title} x{item.quantity}
                          </div>
                        ))}
                        
                        {order.items.length > 2 && (
                          <div className="text-xs text-yellow-500">
                            +{order.items.length - 2} more items
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-800">{formatCurrency(order.total)}</td>
                    <td className="py-4 px-6">
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
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <Link 
                          to={`/order-confirmation/${order._id}`}
                          className="p-1.5 bg-yellow-100 text-yellow-600 rounded-full hover:bg-yellow-200 transition-colors"
                          title="View Order"
                        >
                          <FaEye size={14} />
                        </Link>
                        
                        {order.fulfillmentStatus === 'completed' && (
                          <Link 
                            to={`/order-confirmation/${order._id}#downloads`}
                            className="p-1.5 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                            title="Download Products"
                          >
                            <FaDownload size={14} />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Orders List - Mobile View */}
          <div className="md:hidden divide-y divide-slate-200">
            {ordersData && ordersData.orders.map(order => (
              <div key={order._id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-slate-800">{order.orderNumber}</div>
                    <div className="text-sm text-slate-500">{formatDate(order.date)}</div>
                  </div>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.paymentStatus === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : order.paymentStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </span>
                </div>
                
                <div className="mb-3">
                  {order.items.slice(0, 2).map((item, index) => (
                    <div key={index} className="text-sm text-slate-600">
                      {item.title} x{item.quantity}
                    </div>
                  ))}
                  
                  {order.items.length > 2 && (
                    <div className="text-xs text-yellow-500">
                      +{order.items.length - 2} more items
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="font-medium text-slate-800">{formatCurrency(order.total)}</div>
                  
                  <div className="flex space-x-2">
                    <Link 
                      to={`/order-confirmation/${order._id}`}
                      className="px-3 py-1 bg-yellow-500 text-white text-sm rounded-full hover:bg-yellow-600 transition-colors flex items-center"
                    >
                      <FaEye size={12} className="mr-1" />
                      View
                    </Link>
                    
                    {order.fulfillmentStatus === 'completed' && (
                      <Link 
                        to={`/order-confirmation/${order._id}#downloads`}
                        className="px-3 py-1 bg-green-500 text-white text-sm rounded-full hover:bg-green-600 transition-colors flex items-center"
                      >
                        <FaDownload size={12} className="mr-1" />
                        Download
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Pagination */}
      {ordersData && ordersData.pages > 1 && (
        <Pagination 
          currentPage={ordersData.page}
          totalPages={ordersData.pages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default MyOrdersPage;