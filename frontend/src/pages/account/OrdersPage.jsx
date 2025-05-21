import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const OrdersPage = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        setError('');
        
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/orders`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setOrders(response.data.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [token]);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <h3 className="text-lg font-medium text-slate-800 mb-2">No Orders Yet</h3>
        <p className="text-slate-600 mb-6">You haven't made any purchases yet.</p>
        <Link 
          to="/products"
          className="bg-gradient-to-r from-primary to-primary-light text-slate-800 rounded-lg px-6 py-2 font-semibold inline-block"
        >
          Browse Products
        </Link>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-800">Your Orders</h2>
        <p className="text-slate-600">View and manage your purchases</p>
      </div>
      
      <div className="divide-y divide-slate-100">
        {orders.map((order) => (
          <div key={order._id} className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <div>
                <span className="text-sm text-slate-500">Order #{order.orderNumber}</span>
                <h3 className="font-bold text-slate-800">{formatDate(order.createdAt)}</h3>
              </div>
              
              <div className="mt-2 sm:mt-0">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(order.paymentStatus)}`}>
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              {order.items.map((item, index) => (
                <div key={index} className={`flex justify-between py-2 ${index !== 0 ? 'border-t border-slate-200' : ''}`}>
                  <div>
                    <span className="font-medium text-slate-800">{item.productSnapshot.title}</span>
                    <span className="text-slate-600 ml-2">x{item.quantity}</span>
                  </div>
                  <span className="font-medium text-slate-800">${item.subtotal.toFixed(2)}</span>
                </div>
              ))}
              
              <div className="flex justify-between pt-3 border-t border-slate-300 mt-2">
                <span className="font-semibold text-slate-800">Total</span>
                <span className="font-semibold text-primary">${order.total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Link 
                to={`/orders/${order._id}`}
                className="text-primary font-medium hover:text-primary-dark transition-colors"
              >
                View Order Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;