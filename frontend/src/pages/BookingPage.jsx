import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const BookingPage = () => {
  const { currentUser, token } = useAuth();
  const [step, setStep] = useState(1);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [formData, setFormData] = useState({
    serviceType: 'credit_repair',
    startTime: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  
  // Generate next 14 days for date picker
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date);
      }
    }
    
    return dates;
  };
  
  const availableDates = getAvailableDates();
  
  // Fetch available time slots for selected date
  const fetchAvailableSlots = async (date) => {
    if (!date) return;
    
    try {
      setSlotsLoading(true);
      setError('');
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/bookings/available-slots`,
        {
          params: {
            date,
            serviceType: formData.serviceType
          }
        }
      );
      
      setAvailableSlots(response.data.data);
    } catch (err) {
      console.error('Error fetching available slots:', err);
      setError('Failed to load available time slots. Please try again.');
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };
  
  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setFormData({ ...formData, startTime: '' });
    fetchAvailableSlots(date);
  };
  
  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setError('You must be logged in to book an appointment');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/bookings`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setSuccess(true);
      setConfirmation(response.data.data);
      setStep(3);
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Failed to create booking. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Format time for display
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get service name from type
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

  // Use currentUser to ensure component logic is complete
  useEffect(() => {
    // This ensures currentUser is properly utilized
    if (currentUser) {
      console.log('User is logged in:', currentUser.email);
    }
  }, [currentUser]);
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <div className="py-20 flex-grow">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h1 className="text-2xl font-bold text-slate-800">Schedule Your Free Consultation</h1>
                <p className="text-slate-600">Book a one-on-one session with our credit experts</p>
                
                {/* Progress Steps */}
                <div className="flex items-center justify-between mt-6">
                  <div className="w-full flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step >= 1 ? 'bg-primary text-slate-800' : 'bg-slate-200 text-slate-500'
                    } font-semibold`}>
                      1
                    </div>
                    <div className={`flex-1 h-1 mx-2 ${
                      step >= 2 ? 'bg-primary' : 'bg-slate-200'
                    }`}></div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step >= 2 ? 'bg-primary text-slate-800' : 'bg-slate-200 text-slate-500'
                    } font-semibold`}>
                      2
                    </div>
                    <div className={`flex-1 h-1 mx-2 ${
                      step >= 3 ? 'bg-primary' : 'bg-slate-200'
                    }`}></div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step >= 3 ? 'bg-primary text-slate-800' : 'bg-slate-200 text-slate-500'
                    } font-semibold`}>
                      3
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                    {error}
                  </div>
                )}
                
                {/* Step 1: Select Service */}
                {step === 1 && (
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Select Service Type</h2>
                    
                    <div className="space-y-4 mb-6">
                      {[
                        { value: 'credit_repair', label: 'Credit Repair Consultation', description: 'Discuss your credit challenges and create a personalized repair strategy.' },
                        { value: 'credit_coaching', label: 'Credit Coaching Session', description: 'Learn how to build and maintain excellent credit for long-term success.' },
                        { value: 'financial_planning', label: 'Financial Planning Session', description: 'Create a comprehensive plan to achieve your financial goals.' }
                      ].map((service) => (
                        <div 
                          key={service.value}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            formData.serviceType === service.value 
                              ? 'border-primary bg-primary-light/10' 
                              : 'border-slate-200 hover:border-primary-light'
                          }`}
                          onClick={() => setFormData({ ...formData, serviceType: service.value })}
                        >
                          <div className="flex items-center">
                            <input 
                              type="radio" 
                              name="serviceType" 
                              value={service.value}
                              checked={formData.serviceType === service.value}
                              onChange={() => setFormData({ ...formData, serviceType: service.value })}
                              className="mr-3"
                            />
                            <div>
                              <div className="font-medium text-slate-800">{service.label}</div>
                              <div className="text-sm text-slate-600">{service.description}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-end">
                      <button 
                        onClick={() => setStep(2)}
                        className="bg-gradient-to-r from-primary to-primary-light text-slate-800 rounded-lg px-6 py-2 font-semibold"
                      >
                        Next: Select Date & Time
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Step 2: Select Date & Time */}
                {step === 2 && (
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Select Date & Time</h2>
                    
                    <div className="mb-6">
                      <h3 className="text-md font-medium text-slate-700 mb-2">Select a Date:</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {availableDates.map((date, index) => (
                          <button
                            key={index}
                            onClick={() => handleDateSelect(date.toISOString().split('T')[0])}
                            className={`p-2 text-center rounded-lg border ${
                              selectedDate === date.toISOString().split('T')[0]
                                ? 'border-primary bg-primary-light/10 text-slate-800'
                                : 'border-slate-200 hover:border-primary-light text-slate-600'
                            }`}
                          >
                            <div className="text-xs font-medium">{date.toLocaleDateString('en-US', { month: 'short' })}</div>
                            <div className="text-lg font-bold">{date.getDate()}</div>
                            <div className="text-xs">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {selectedDate && (
                      <div className="mb-6">
                        <h3 className="text-md font-medium text-slate-700 mb-2">Select a Time:</h3>
                        
                        {slotsLoading ? (
                          <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                          </div>
                        ) : availableSlots.length === 0 ? (
                          <div className="text-center py-4 bg-slate-50 rounded-lg">
                            <p className="text-slate-600">No available time slots for this date. Please select another date.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {availableSlots.map((slot, index) => (
                              <button
                                key={index}
                                onClick={() => setFormData({ ...formData, startTime: slot.startTime })}
                                className={`p-2 text-center rounded-lg border ${
                                  formData.startTime === slot.startTime
                                    ? 'border-primary bg-primary-light/10 text-slate-800'
                                    : 'border-slate-200 hover:border-primary-light text-slate-600'
                                }`}
                              >
                                {formatTime(slot.startTime)}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="mb-6">
                      <label htmlFor="notes" className="block text-md font-medium text-slate-700 mb-2">
                        Additional Notes (Optional):
                      </label>
                      <textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        rows={3}
                        placeholder="Let us know any specific topics you'd like to discuss..."
                      ></textarea>
                    </div>
                    
                    <div className="flex justify-between">
                      <button 
                        onClick={() => setStep(1)}
                        className="border border-slate-300 text-slate-700 rounded-lg px-6 py-2 font-medium"
                      >
                        Back
                      </button>
                      
                      <button 
                        onClick={handleSubmit}
                        disabled={!formData.startTime || loading}
                        className="bg-gradient-to-r from-primary to-primary-light text-slate-800 rounded-lg px-6 py-2 font-semibold disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-slate-800 mr-2"></div>
                            Processing...
                          </div>
                        ) : (
                          'Confirm Booking'
                        )}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Step 3: Confirmation */}
                {step === 3 && success && confirmation && (
                  <div className="text-center py-8">
                    <div className="h-16 w-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Booking Confirmed!</h2>
                    
                    <div className="bg-slate-50 rounded-lg p-6 mb-6 text-left">
                      <div className="mb-4">
                        <h3 className="font-semibold text-slate-800">Service:</h3>
                        <p className="text-slate-600">{getServiceName(formData.serviceType)}</p>
                      </div>
                      
                      <div className="mb-4">
                        <h3 className="font-semibold text-slate-800">Date & Time:</h3>
                        <p className="text-slate-600">{formatDate(formData.startTime)} at {formatTime(formData.startTime)}</p>
                      </div>
                      
                      {confirmation.meetingLink && (
                        <div className="mb-4">
                          <h3 className="font-semibold text-slate-800">Meeting Link:</h3>
                          <a 
                            href={confirmation.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline"
                          >
                            {confirmation.meetingLink}
                          </a>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-slate-600 mb-6">
                      A confirmation email has been sent to your email address. You can also manage your bookings in your account.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link 
                        to="/account/bookings"
                        className="bg-gradient-to-r from-primary to-primary-light text-slate-800 rounded-lg px-6 py-2 font-semibold"
                      >
                        View My Bookings
                      </Link>
                      
                      <Link 
                        to="/"
                        className="border border-slate-300 text-slate-700 rounded-lg px-6 py-2 font-medium"
                      >
                        Return to Home
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default BookingPage;