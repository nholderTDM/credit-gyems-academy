import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const BookingsPage = () => {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [currentBooking, setCurrentBooking] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  
  useEffect(() => {
    const fetchBookings = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        setError('');
        
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/bookings`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setBookings(response.data.data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load your bookings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [token]);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getServiceName = (serviceType) => {
    switch (serviceType) {
      case 'credit_repair':
        return 'Credit Repair Consultation';
      case 'credit_coaching':
        return 'Credit Coaching Session';
      case 'financial_planning':
        return 'Financial Planning Session';
      default:
        return serviceType.replace('_', ' ');
    }
  };
  
  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'no_show':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };
  
  const openCancelModal = (booking) => {
    setCurrentBooking(booking);
    setShowCancelModal(true);
  };
  
  const handleCancelBooking = async () => {
    if (!token || !currentBooking) return;
    
    try {
      setCancelLoading(true);
      
      await axios.put(
        `${import.meta.env.VITE_API_URL}/bookings/${currentBooking._id}/cancel`,
        { reason: cancelReason },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update booking status in the state
      setBookings(prevBookings => 
        prevBookings.map(booking => {
          if (booking._id === currentBooking._id) {
            return {
              ...booking,
              status: 'cancelled'
            };
          }
          return booking;
        })
      );
      
      // Close modal and reset state
      setShowCancelModal(false);
      setCurrentBooking(null);
      setCancelReason('');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Failed to cancel booking. Please try again later.');
    } finally {
      setCancelLoading(false);
    }
  };
  
  const canCancel = (booking) => {
    return (
      booking.status === 'scheduled' && 
      new Date(booking.startTime) > new Date()
    );
  };
  
  const isUpcoming = (booking) => {
    return new Date(booking.startTime) > new Date();
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
  
  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100 text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="text-lg font-medium text-slate-800 mb-2">No Bookings Yet</h3>
        <p className="text-slate-600 mb-6">You haven't scheduled any consultations yet.</p>
        <a 
          href="/booking"
          className="bg-gradient-to-r from-primary to-primary-light text-slate-800 rounded-lg px-6 py-2 font-semibold inline-block"
        >
          Schedule a Consultation
        </a>
      </div>
    );
  }
  
  // Separate bookings into upcoming and past
  const upcomingBookings = bookings.filter(booking => isUpcoming(booking));
  const pastBookings = bookings.filter(booking => !isUpcoming(booking));
  
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Upcoming Bookings</h2>
          <p className="text-slate-600">Your scheduled consultations</p>
        </div>
        
        {upcomingBookings.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-slate-600">You don't have any upcoming bookings.</p>
            <a 
              href="/booking"
              className="mt-4 inline-block bg-gradient-to-r from-primary to-primary-light text-slate-800 rounded-lg px-6 py-2 font-semibold"
            >
              Schedule a Consultation
            </a>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {upcomingBookings.map((booking) => (
              <div key={booking._id} className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                    <h3 className="font-bold text-slate-800 mt-2">{getServiceName(booking.serviceType)}</h3>
                    <p className="text-slate-600 mt-1">
                      {formatDate(booking.startTime)} at {formatTime(booking.startTime)}
                    </p>
                  </div>
                  
                  <div className="mt-4 md:mt-0 space-x-2">
                    {booking.meetingLink && (
                      <a 
                        href={booking.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-primary text-slate-800 rounded-lg font-medium"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Join Meeting
                      </a>
                    )}
                    
                    {canCancel(booking) && (
                      <button
                        onClick={() => openCancelModal(booking)}
                        className="inline-flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
                
                {booking.customerNotes && (
                  <div className="bg-slate-50 p-4 rounded-lg mt-4">
                    <p className="text-sm font-medium text-slate-700 mb-1">Notes:</p>
                    <p className="text-slate-600">{booking.customerNotes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {pastBookings.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-800">Past Bookings</h2>
            <p className="text-slate-600">Your consultation history</p>
          </div>
          
          <div className="divide-y divide-slate-100">
            {pastBookings.map((booking) => (
              <div key={booking._id} className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                    <h3 className="font-bold text-slate-800 mt-2">{getServiceName(booking.serviceType)}</h3>
                    <p className="text-slate-600 mt-1">
                      {formatDate(booking.startTime)} at {formatTime(booking.startTime)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Cancel Booking</h3>
            
            <p className="text-slate-600 mb-4">
              Are you sure you want to cancel your {getServiceName(currentBooking?.serviceType || '')} scheduled for {formatDate(currentBooking?.startTime || '')} at {formatTime(currentBooking?.startTime || '')}?
            </p>
            
            <div className="mb-4">
              <label htmlFor="cancelReason" className="block text-sm font-medium text-slate-700 mb-1">
                Reason for Cancellation (Optional)
              </label>
              <textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
                placeholder="Please let us know why you're cancelling..."
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCurrentBooking(null);
                  setCancelReason('');
                }}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg"
              >
                Keep Booking
              </button>
              
              <button
                onClick={handleCancelBooking}
                disabled={cancelLoading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg disabled:opacity-70"
              >
                {cancelLoading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                ) : (
                  'Cancel Booking'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;