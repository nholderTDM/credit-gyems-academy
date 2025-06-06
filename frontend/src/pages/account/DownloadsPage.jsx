import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const DownloadsPage = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchDownloads = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        setError('');
        
        // Fetch all orders
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/orders`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        // Filter for completed orders with digital products
        const completedOrders = response.data.data.filter(order => 
          order.paymentStatus === 'completed' && 
          order.fulfillmentStatus === 'completed' &&
          order.items.some(item => item.productSnapshot.type === 'ebook') &&
          order.fulfillmentDetails?.downloadLinks
        );
        
        setOrders(completedOrders);
      } catch (err) {
        console.error('Error fetching downloads:', err);
        setError('Failed to load your downloads. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDownloads();
  }, [token]);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const isExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };
  
  // Function to refresh download link if expired
  const refreshDownloadLink = async (orderId) => {
    if (!token) return;
    
    try {
      setLoading(true);
      
      // Call API to get fresh download links
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/orders/${orderId}/downloads`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update the order in the state with new download links
      setOrders(prevOrders => 
        prevOrders.map(order => {
          if (order._id === orderId) {
            return {
              ...order,
              fulfillmentDetails: {
                downloadLinks: response.data.data.downloadLinks
              }
            };
          }
          return order;
        })
      );
    } catch (err) {
      console.error('Error refreshing download link:', err);
      alert('Failed to refresh download link. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary text-slate-800 rounded-lg px-4 py-2 font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100 text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <h3 className="text-lg font-medium text-slate-800 mb-2">No Downloads Available</h3>
        <p className="text-slate-600 mb-6">You haven't purchased any digital products yet.</p>
        <a 
          href="/products?category=ebook"
          className="bg-gradient-to-r from-primary to-primary-light text-slate-800 rounded-lg px-6 py-2 font-semibold inline-block"
        >
          Browse E-Books
        </a>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-800">Your Downloads</h2>
        <p className="text-slate-600">Access your purchased digital products</p>
      </div>
      
      <div className="p-6 space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 p-4 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <span className="text-sm text-slate-500">Order #{order.orderNumber}</span>
                  <h3 className="font-medium text-slate-800">Purchased on {formatDate(order.createdAt)}</h3>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              {order.fulfillmentDetails?.downloadLinks.map((link, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg mb-2">
                  <span className="font-medium text-slate-800">{link.title}</span>
                  
                  {isExpired(link.expiresAt) ? (
                    <button
                      onClick={() => refreshDownloadLink(order._id)}
                      className="px-4 py-1.5 bg-primary hover:bg-primary-dark text-slate-800 text-sm font-medium rounded-full shadow-sm transition-all"
                    >
                      Refresh Link
                    </button>
                  ) : (
                    <a 
                      href={link.url} 
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-1.5 bg-primary hover:bg-primary-dark text-slate-800 text-sm font-medium rounded-full shadow-sm transition-all"
                    >
                      Download
                    </a>
                  )}
                </div>
              ))}
              
              <div className="mt-2 text-sm text-slate-500">
                Download links expire after 7 days. If a link is expired, click "Refresh Link" to generate a new one.
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DownloadsPage;