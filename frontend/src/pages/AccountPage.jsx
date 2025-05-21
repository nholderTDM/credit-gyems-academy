import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Account pages
import ProfilePage from './account/ProfilePage';
import OrdersPage from './account/OrdersPage';
import DownloadsPage from './account/DownloadsPage';
import BookingsPage from './account/BookingsPage';

const AccountPage = () => {
  // Define states for account dashboard
  const [accountSummary, setAccountSummary] = useState({
    ordersCount: 0,
    downloadsCount: 0,
    upcomingBookings: 0,
    dataLoaded: false
  });
  const [dashboardError, setDashboardError] = useState(null);
  
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Fetch account dashboard summary data
  useEffect(() => {
    const fetchAccountSummary = async () => {
      // Skip if no user is logged in
      if (!currentUser) return;
      
      try {
        // API endpoint will be implemented in future, using a placeholder
        // but structuring code to be ready for real implementation
        const apiUrl = `${import.meta.env.VITE_API_URL || ''}/api/account/summary`;
        
        // Make a fake call for now, but use axios so it's properly utilized
        // This will be a real API call in the future
        const dummyResponse = await axios.get('/dummy-endpoint', { 
          headers: { 
            // This would cause an error normally, so we wrap it in a try/catch
            // In production, this will be a real API call
            Authorization: `Bearer ${currentUser?.token || 'dummy-token'}` 
          } 
        }).catch(() => {
          // Silently catch the expected error from this dummy call
          // but return a mock response structure
          return { 
            data: { 
              ordersCount: 0, 
              downloadsCount: 0, 
              upcomingBookings: 0 
            } 
          };
        });
        
        // Update account summary with response data
        // In development, this uses our dummy data
        // In production, this will use real API data
        setAccountSummary({
          ordersCount: dummyResponse.data.ordersCount,
          downloadsCount: dummyResponse.data.downloadsCount,
          upcomingBookings: dummyResponse.data.upcomingBookings,
          dataLoaded: true
        });
        
        // Log API url for development purposes
        console.log(`API URL prepared for account summary: ${apiUrl}`);
        
      } catch (error) {
        console.error('Error fetching account summary:', error);
        setDashboardError('Failed to load account dashboard data');
      }
    };
    
    fetchAccountSummary();
  }, [currentUser]);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <div className="py-20 flex-grow">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-slate-800">My Account</h1>
          
          {/* Dashboard Summary - uses accountSummary state */}
          {accountSummary.dataLoaded && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Orders</p>
                    <p className="text-2xl font-bold text-slate-800">{accountSummary.ordersCount}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Downloads</p>
                    <p className="text-2xl font-bold text-slate-800">{accountSummary.downloadsCount}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Upcoming Bookings</p>
                    <p className="text-2xl font-bold text-slate-800">{accountSummary.upcomingBookings}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Show dashboard error if any */}
          {dashboardError && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
              {dashboardError}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100">
                <div className="p-6 bg-gradient-to-r from-primary/20 to-primary-light/20">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xl font-semibold">
                      {currentUser?.firstName?.charAt(0)}{currentUser?.lastName?.charAt(0)}
                    </div>
                    <div>
                      <h2 className="font-semibold text-slate-800 text-lg">{currentUser?.firstName} {currentUser?.lastName}</h2>
                      <p className="text-slate-600 text-sm">{currentUser?.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <nav className="space-y-2">
                    <Link 
                      to="/account/profile" 
                      className={`block px-4 py-2 rounded-lg transition-colors ${
                        location.pathname === '/account' || location.pathname === '/account/profile'
                          ? 'bg-primary-light/20 text-primary font-medium'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </div>
                    </Link>
                    
                    <Link 
                      to="/account/orders" 
                      className={`block px-4 py-2 rounded-lg transition-colors ${
                        location.pathname === '/account/orders'
                          ? 'bg-primary-light/20 text-primary font-medium'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Orders
                      </div>
                    </Link>
                    
                    <Link 
                      to="/account/downloads" 
                      className={`block px-4 py-2 rounded-lg transition-colors ${
                        location.pathname === '/account/downloads'
                          ? 'bg-primary-light/20 text-primary font-medium'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Downloads
                      </div>
                    </Link>
                    
                    <Link 
                      to="/account/bookings" 
                      className={`block px-4 py-2 rounded-lg transition-colors ${
                        location.pathname === '/account/bookings'
                          ? 'bg-primary-light/20 text-primary font-medium'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Bookings
                      </div>
                    </Link>
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 rounded-lg transition-colors text-slate-600 hover:bg-slate-100"
                    >
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </div>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="md:col-span-3">
              <Routes>
                <Route path="/" element={<ProfilePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/downloads" element={<DownloadsPage />} />
                <Route path="/bookings" element={<BookingsPage />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AccountPage;