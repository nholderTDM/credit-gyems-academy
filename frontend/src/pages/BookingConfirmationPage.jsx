import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  Download,
  Edit3,
  X,
  AlertCircle,
  ArrowLeft,
  Video,
  Users,
  FileText,
  Send,
  Loader2,
  CheckSquare,
  ExternalLink,
  Bell
} from 'lucide-react';

const BookingConfirmationPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBookingDetails = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch booking details');
      }

      const data = await response.json();
      setBooking(data.booking);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async (date) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/bookings/available-slots?date=${date}&serviceId=${booking.serviceId._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch available slots');
      }

      const data = await response.json();
      setAvailableSlots(data.availableSlots);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const handleReschedule = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/bookings/${bookingId}/reschedule`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newStartTime: `${selectedDate}T${selectedTime}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reschedule booking');
      }

      const data = await response.json();
      setBooking(data.booking);
      setIsRescheduleModalOpen(false);
      setIsProcessing(false);
      
      // Show success message
      alert('Your booking has been successfully rescheduled!');
    } catch {
      setIsProcessing(false);
      alert('Error rescheduling booking. Please try again.');
    }
  };

  const handleCancel = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: cancelReason })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      setIsCancelModalOpen(false);
      setIsProcessing(false);
      
      // Redirect to bookings page
      navigate('/account/consultations');
    } catch {
      setIsProcessing(false);
      alert('Error cancelling booking. Please try again.');
    }
  };

  const resendConfirmationEmail = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/bookings/${bookingId}/resend-confirmation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to resend email');
      }

      setEmailSent(true);
      setIsProcessing(false);
      setTimeout(() => setEmailSent(false), 3000);
    } catch {
      setIsProcessing(false);
      alert('Error sending email. Please try again.');
    }
  };

  const addToCalendar = (type) => {
    if (!booking) return;

    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);
    const title = `${booking.serviceId.name} - Credit Gyems Academy`;
    const details = `Consultation with DorTae Freeman\n\nNotes: ${booking.customerNotes || 'N/A'}`;

    if (type === 'google') {
      const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${endTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&details=${encodeURIComponent(details)}`;
      window.open(googleUrl, '_blank');
    } else if (type === 'outlook') {
      const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&startdt=${startTime.toISOString()}&enddt=${endTime.toISOString()}&body=${encodeURIComponent(details)}`;
      window.open(outlookUrl, '_blank');
    } else if (type === 'ics') {
      // Generate ICS file content
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
URL:${window.location.href}
DTSTART:${startTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}
DTEND:${endTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}
SUMMARY:${title}
DESCRIPTION:${details}
END:VEVENT
END:VCALENDAR`;

      const blob = new Blob([icsContent], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `booking-${bookingId}.ics`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#FFD700] mx-auto" />
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Booking Not Found</h2>
          <p className="mt-2 text-gray-600">{error || 'The booking you are looking for does not exist.'}</p>
          <Link 
            to="/account/consultations"
            className="mt-4 inline-flex items-center px-4 py-2 bg-[#FFD700] text-white rounded-lg hover:bg-[#FFD700]/90"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Consultations
          </Link>
        </div>
      </div>
    );
  }

  const bookingDate = new Date(booking.startTime);
  const bookingEndTime = new Date(booking.endTime);
  const isVideoCall = booking.serviceId.type === 'video';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-[#FFD700] to-[#FF0000] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <CheckCircle className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-xl opacity-90">Your consultation has been successfully scheduled</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Booking Details Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{booking.serviceId.name}</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-3 text-[#FFD700]" />
                    <span>{bookingDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-3 text-[#FFD700]" />
                    <span>
                      {bookingDate.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                      })} - {bookingEndTime.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                      })} ({booking.serviceId.duration} minutes)
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    {isVideoCall ? (
                      <>
                        <Video className="h-5 w-5 mr-3 text-[#FFD700]" />
                        <span>Video Call (Link will be sent via email)</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="h-5 w-5 mr-3 text-[#FFD700]" />
                        <span>{booking.location || 'Location to be confirmed'}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Your Information</h4>
                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    <span>{booking.customerName}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{booking.customerEmail}</span>
                  </div>
                  {booking.customerPhone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{booking.customerPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              {booking.customerNotes && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Your Notes</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{booking.customerNotes}</p>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Add to Calendar</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => addToCalendar('google')}
                    className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Add to Google Calendar
                  </button>
                  <button
                    onClick={() => addToCalendar('outlook')}
                    className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Add to Outlook Calendar
                  </button>
                  <button
                    onClick={() => addToCalendar('ics')}
                    className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download .ics File
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Manage Booking</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setIsRescheduleModalOpen(true)}
                    className="w-full flex items-center justify-center px-4 py-3 bg-[#FFD700] text-white rounded-lg hover:bg-[#FFD700]/90 transition-colors"
                  >
                    <Edit3 className="h-5 w-5 mr-2" />
                    Reschedule Appointment
                  </button>
                  <button
                    onClick={() => setIsCancelModalOpen(true)}
                    className="w-full flex items-center justify-center px-4 py-3 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <X className="h-5 w-5 mr-2" />
                    Cancel Appointment
                  </button>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={resendConfirmationEmail}
                  disabled={isProcessing || emailSent}
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  {emailSent ? (
                    <>
                      <CheckSquare className="h-4 w-4 mr-1 text-green-600" />
                      Email Sent!
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-1" />
                      Resend Confirmation Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Booking ID */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Booking ID: <span className="font-mono font-medium">{booking._id}</span>
            </p>
          </div>
        </div>

        {/* What's Next Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">What's Next?</h3>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 bg-[#FFD700]/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-[#FFD700]" />
              </div>
              <div className="ml-4">
                <h4 className="font-semibold text-gray-900">Confirmation Email Sent</h4>
                <p className="text-gray-600 mt-1">
                  We've sent a confirmation email to {booking.customerEmail} with all your booking details.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 bg-[#FFD700]/20 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-[#FFD700]" />
              </div>
              <div className="ml-4">
                <h4 className="font-semibold text-gray-900">Prepare for Your Session</h4>
                <p className="text-gray-600 mt-1">
                  Gather any relevant documents or questions you'd like to discuss during your consultation.
                </p>
                <Link 
                  to="/account/resources"
                  className="inline-flex items-center text-[#FF0000] hover:text-[#FF0000]/80 mt-2 text-sm font-medium"
                >
                  View preparation resources
                  <ExternalLink className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 bg-[#FFD700]/20 rounded-full flex items-center justify-center">
                <Bell className="h-6 w-6 text-[#FFD700]" />
              </div>
              <div className="ml-4">
                <h4 className="font-semibold text-gray-900">Reminder Notifications</h4>
                <p className="text-gray-600 mt-1">
                  You'll receive reminder emails 24 hours and 1 hour before your appointment.
                </p>
              </div>
            </div>

            {isVideoCall && (
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 bg-[#FFD700]/20 rounded-full flex items-center justify-center">
                  <Video className="h-6 w-6 text-[#FFD700]" />
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Video Call Link</h4>
                  <p className="text-gray-600 mt-1">
                    The video call link will be sent to your email 30 minutes before the appointment starts.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link 
            to="/account/dashboard"
            className="flex-1 flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Link>
          <Link 
            to="/account/consultations"
            className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FF0000] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Users className="mr-2 h-5 w-5" />
            View All Consultations
          </Link>
        </div>
      </div>

      {/* Reschedule Modal */}
      {isRescheduleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reschedule Appointment</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select New Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    fetchAvailableSlots(e.target.value);
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                />
              </div>

              {selectedDate && availableSlots.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Time
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                  >
                    <option value="">Choose a time</option>
                    {availableSlots.map((slot) => (
                      <option key={slot.startTime} value={new Date(slot.startTime).toTimeString().slice(0, 5)}>
                        {new Date(slot.startTime).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedDate && availableSlots.length === 0 && (
                <p className="text-sm text-red-600">No available slots for this date. Please select another date.</p>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setIsRescheduleModalOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                disabled={!selectedDate || !selectedTime || isProcessing}
                className="flex-1 px-4 py-2 bg-[#FFD700] text-white rounded-lg hover:bg-[#FFD700]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  'Confirm Reschedule'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Cancel Appointment</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                placeholder="Please let us know why you're cancelling..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleCancel}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  'Cancel Appointment'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingConfirmationPage;