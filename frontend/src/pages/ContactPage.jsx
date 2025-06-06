import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, Clock, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    service: '',
    message: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({});

  const services = [
    'Credit Repair',
    'Credit Coaching',
    'Financial Planning',
    'Masterclass Inquiry',
    'General Inquiry'
  ];

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone is required';
    } else if (!/^[\d\s\-+()]+$/.test(formData.phone)) {
      errors.phone = 'Phone number is invalid';
    }
    if (!formData.subject.trim()) errors.subject = 'Subject is required';
    if (!formData.service) errors.service = 'Please select a service';
    if (!formData.message.trim()) errors.message = 'Message is required';
    
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setError('Please fill in all required fields correctly');
      setLoading(false);
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      return;
    }
    
    try {
      // API call to save to MongoDB and Google Sheets
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        service: '',
        message: ''
      });
      setTouched({});
      
      setTimeout(() => setSuccess(false), 5000);
    } catch {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const errors = validateForm();

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
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent animate-fadeIn">
              Get In Touch
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto animate-slideUp">
              Ready to transform your credit journey? We're here to help you achieve financial freedom.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information & Form */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            {/* Phone Card */}
            <div className="group bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-yellow-400/20">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6 text-gray-900" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Call Us</h3>
                  <p className="text-gray-300">(555) 123-4567</p>
                  <p className="text-sm text-gray-400 mt-1">Mon-Fri 9AM-6PM EST</p>
                </div>
              </div>
            </div>

            {/* Email Card */}
            <div className="group bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-red-500/20">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Email Us</h3>
                  <p className="text-gray-300">info@creditgyems369.com</p>
                  <p className="text-sm text-gray-400 mt-1">24/7 Support</p>
                </div>
              </div>
            </div>

            {/* Address Card */}
            <div className="group bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-yellow-400/20">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gradient-to-r from-yellow-400 to-red-500 rounded-xl group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Visit Us</h3>
                  <p className="text-gray-300">123 Financial Plaza</p>
                  <p className="text-gray-300">Suite 456</p>
                  <p className="text-gray-300">Atlanta, GA 30301</p>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="group bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-red-500/20">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gradient-to-r from-red-500 to-yellow-400 rounded-xl group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Business Hours</h3>
                  <div className="space-y-1 text-gray-300 text-sm">
                    <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p>Saturday: 10:00 AM - 4:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
                Send Us a Message
              </h2>
              
              {success && (
                <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl flex items-center space-x-3 animate-slideDown">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <p className="text-green-300">Your message has been sent successfully! We'll get back to you soon.</p>
                </div>
              )}
              
              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center space-x-3 animate-slideDown">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-red-300">{error}</p>
                </div>
              )}

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={() => handleBlur('name')}
                      className={`w-full px-4 py-3 bg-white/10 border ${
                        touched.name && errors.name ? 'border-red-500' : 'border-white/20'
                      } rounded-xl focus:outline-none focus:border-yellow-400 transition-colors backdrop-blur-sm`}
                      placeholder="John Doe"
                    />
                    {touched.name && errors.name && (
                      <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={() => handleBlur('email')}
                      className={`w-full px-4 py-3 bg-white/10 border ${
                        touched.email && errors.email ? 'border-red-500' : 'border-white/20'
                      } rounded-xl focus:outline-none focus:border-yellow-400 transition-colors backdrop-blur-sm`}
                      placeholder="john@example.com"
                    />
                    {touched.email && errors.email && (
                      <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={() => handleBlur('phone')}
                      className={`w-full px-4 py-3 bg-white/10 border ${
                        touched.phone && errors.phone ? 'border-red-500' : 'border-white/20'
                      } rounded-xl focus:outline-none focus:border-yellow-400 transition-colors backdrop-blur-sm`}
                      placeholder="(555) 123-4567"
                    />
                    {touched.phone && errors.phone && (
                      <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
                    )}
                  </div>

                  {/* Service Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Service Interest <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      onBlur={() => handleBlur('service')}
                      className={`w-full px-4 py-3 bg-white/10 border ${
                        touched.service && errors.service ? 'border-red-500' : 'border-white/20'
                      } rounded-xl focus:outline-none focus:border-yellow-400 transition-colors backdrop-blur-sm appearance-none cursor-pointer`}
                    >
                      <option value="" className="bg-gray-800">Select a service</option>
                      {services.map(service => (
                        <option key={service} value={service} className="bg-gray-800">
                          {service}
                        </option>
                      ))}
                    </select>
                    {touched.service && errors.service && (
                      <p className="mt-1 text-sm text-red-400">{errors.service}</p>
                    )}
                  </div>
                </div>

                {/* Subject Field */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Subject <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    onBlur={() => handleBlur('subject')}
                    className={`w-full px-4 py-3 bg-white/10 border ${
                      touched.subject && errors.subject ? 'border-red-500' : 'border-white/20'
                    } rounded-xl focus:outline-none focus:border-yellow-400 transition-colors backdrop-blur-sm`}
                    placeholder="How can we help you?"
                  />
                  {touched.subject && errors.subject && (
                    <p className="mt-1 text-sm text-red-400">{errors.subject}</p>
                  )}
                </div>

                {/* Message Field */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Message <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={() => handleBlur('message')}
                    rows="6"
                    className={`w-full px-4 py-3 bg-white/10 border ${
                      touched.message && errors.message ? 'border-red-500' : 'border-white/20'
                    } rounded-xl focus:outline-none focus:border-yellow-400 transition-colors backdrop-blur-sm resize-none`}
                    placeholder="Tell us more about your needs..."
                  />
                  {touched.message && errors.message && (
                    <p className="mt-1 text-sm text-red-400">{errors.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-yellow-400 to-red-500 text-gray-900 font-bold rounded-xl hover:shadow-lg hover:shadow-yellow-400/30 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-2 border border-white/10">
            <div className="aspect-video bg-gray-800 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <p className="text-gray-400">Interactive map would be displayed here</p>
                <p className="text-sm text-gray-500 mt-2">123 Financial Plaza, Atlanta, GA</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
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
        
        @keyframes slideDown {
          from { 
            opacity: 0;
            transform: translateY(-20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.8s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ContactPage;