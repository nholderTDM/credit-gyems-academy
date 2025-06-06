import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, X, Edit3, ChevronLeft, ChevronRight, AlertCircle, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [swipeDirection, setSwipeDirection] = useState(0);
  const [touchStart, setTouchStart] = useState(0);

  // Mock data - replace with API call
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockBookings = [
        {
          id: '1',
          service: 'Credit Repair Consultation',
          date: '2025-06-05',
          time: '10:00 AM',
          duration: 60,
          location: '123 Financial Plaza, Suite 456',
          status: 'confirmed',
          provider: 'DorTae Freeman',
          notes: 'First consultation session',
          price: 150
        },
        {
          id: '2',
          service: 'Financial Planning Session',
          date: '2025-06-12',
          time: '2:00 PM',
          duration: 90,
          location: 'Virtual Meeting',
          status: 'pending',
          provider: 'DorTae Freeman',
          notes: 'Retirement planning discussion',
          price: 200
        },
        {
          id: '3',
          service: 'Credit Coaching',
          date: '2025-05-15',
          time: '11:00 AM',
          duration: 45,
          location: '123 Financial Plaza, Suite 456',
          status: 'completed',
          provider: 'DorTae Freeman',
          notes: 'Monthly check-in',
          price: 100
        },
        {
          id: '4',
          service: 'Credit Repair Consultation',
          date: '2025-04-20',
          time: '3:00 PM',
          duration: 60,
          location: 'Virtual Meeting',
          status: 'cancelled',
          provider: 'DorTae Freeman',
          notes: 'Initial consultation',
          price: 150
        }
      ];
      
      setBookings(mockBookings);
      setLoading(false);
    };
    
    fetchBookings();
  }, []);

  const isBookingCancellable = (booking) => {
    const bookingDate = new Date(booking.date + ' ' + booking.time);
    const now = new Date();
    const hoursDiff = (bookingDate - now) / (1000 * 60 * 60);
    return hoursDiff >= 24 && booking.status === 'confirmed';
  };

  const isBookingReschedulable = (booking) => {
    const bookingDate = new Date(booking.date + ' ' + booking.time);
    const now = new Date();
    const hoursDiff = (bookingDate - now) / (1000 * 60 * 60);
    return hoursDiff >= 48 && booking.status === 'confirmed';
  };

  const handleCancel = async (bookingId) => {
    // API call to cancel booking
    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, status: 'cancelled' } : b
    ));
    setShowModal(false);
  };

  const handleReschedule = (booking) => {
    // Would navigate to reschedule page or open reschedule modal
    console.log('Reschedule booking:', booking);
    setShowModal(false);
  };

  const openModal = (booking, action) => {
    setSelectedBooking(booking);
    setModalAction(action);
    setShowModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-400" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (activeTab === 'upcoming') {
      return bookingDate >= today && booking.status !== 'completed' && booking.status !== 'cancelled';
    } else {
      return bookingDate < today || booking.status === 'completed' || booking.status === 'cancelled';
    }
  });

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!touchStart) return;
    const currentTouch = e.touches[0].clientX;
    setSwipeDirection(currentTouch - touchStart);
  };

  const handleTouchEnd = () => {
    if (Math.abs(swipeDirection) > 50) {
      if (swipeDirection > 0 && activeTab === 'past') {
        setActiveTab('upcoming');
      } else if (swipeDirection < 0 && activeTab === 'upcoming') {
        setActiveTab('past');
      }
    }
    setSwipeDirection(0);
    setTouchStart(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-red-500/10"></div>
        <div className="absolute inset-0">
          <div className="absolute transform rotate-45 -right-40 -top-40 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-red-500/20 rounded-full blur-3xl"></div>
          <div className="absolute transform rotate-45 -left-40 -bottom-40 w-80 h-80 bg-gradient-to-r from-red-500/20 to-yellow-400/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
              My Bookings
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Manage your appointments and track your credit journey progress
            </p>
          </div>
        </div>
      </div>

      {/* Bookings Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Tab Navigation */}
        <div 
          className="flex mb-8 bg-white/5 backdrop-blur-lg rounded-xl p-1 max-w-md mx-auto"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'upcoming'
                ? 'bg-gradient-to-r from-yellow-400 to-red-500 text-gray-900'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'past'
                ? 'bg-gradient-to-r from-yellow-400 to-red-500 text-gray-900'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Past
          </button>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No {activeTab} bookings found</p>
            {activeTab === 'upcoming' && (
              <button className="mt-4 px-6 py-3 bg-gradient-to-r from-yellow-400 to-red-500 text-gray-900 font-bold rounded-xl hover:shadow-lg hover:shadow-yellow-400/30 transform hover:scale-105 transition-all duration-300">
                Book a Consultation
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
              >
                {/* Booking Header */}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">{booking.service}</h3>
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm border ${getStatusColor(booking.status)}`}>
                    {getStatusIcon(booking.status)}
                    <span className="capitalize">{booking.status}</span>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-yellow-400" />
                    <span>{new Date(booking.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-red-500" />
                    <span>{booking.time} ({booking.duration} min)</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm">{booking.location}</span>
                  </div>
                  
                  {booking.notes && (
                    <div className="pt-3 border-t border-white/10">
                      <p className="text-sm italic">"{booking.notes}"</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {booking.status === 'confirmed' && (
                  <div className="mt-6 flex space-x-3">
                    {isBookingReschedulable(booking) && (
                      <button
                        onClick={() => openModal(booking, 'reschedule')}
                        className="flex-1 py-2 px-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Reschedule</span>
                      </button>
                    )}
                    {isBookingCancellable(booking) && (
                      <button
                        onClick={() => openModal(booking, 'cancel')}
                        className="flex-1 py-2 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Notice for time restrictions */}
                {booking.status === 'confirmed' && !isBookingCancellable(booking) && (
                  <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
                      <p className="text-xs text-yellow-300">
                        Cancellations must be made at least 24 hours in advance. 
                        Rescheduling requires 48 hours notice.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full animate-slideUp">
            <h3 className="text-2xl font-bold mb-4">
              {modalAction === 'cancel' ? 'Cancel Booking' : 'Reschedule Booking'}
            </h3>
            
            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <p className="font-semibold mb-2">{selectedBooking.service}</p>
              <p className="text-gray-400 text-sm">
                {new Date(selectedBooking.date).toLocaleDateString()} at {selectedBooking.time}
              </p>
            </div>
            
            {modalAction === 'cancel' ? (
              <>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to cancel this booking? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    Keep Booking
                  </button>
                  <button
                    onClick={() => handleCancel(selectedBooking.id)}
                    className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
                  >
                    Cancel Booking
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-300 mb-6">
                  Select a new date and time for your appointment.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReschedule(selectedBooking)}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-yellow-400 to-red-500 text-gray-900 font-bold rounded-xl hover:shadow-lg hover:shadow-yellow-400/30 transition-all"
                  >
                    Continue
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MyBookingsPage;
// This code defines a MyBookingsPage component that displays a user's bookings with options to cancel or reschedule them.