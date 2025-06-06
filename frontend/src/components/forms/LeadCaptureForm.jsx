import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Input from '../common/Input';

const LeadCaptureForm = ({
  onSubmit,
  offerTitle = 'Free Credit Score Improvement Guide',
  offerDescription = 'Get instant access to our proven strategies for boosting your credit score by 100+ points',
  showCountdown = true,
  countdownMinutes = 15,
  variant = 'default',
  className = ''
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    agreeToTerms: false,
    marketingConsent: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(countdownMinutes * 60);

  // Countdown timer
  useEffect(() => {
    if (!showCountdown || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showCountdown, timeLeft]);

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms to continue';
    }

    return newErrors;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user makes changes
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      setSubmitSuccess(true);
      // Reset form
      setFormData({
        firstName: '',
        email: '',
        agreeToTerms: false,
        marketingConsent: false
      });
    } catch  {
      setErrors({ submit: 'Failed to process request. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Variant styles
  const variantStyles = {
    default: 'bg-white',
    gradient: 'bg-gradient-to-br from-yellow-50 to-red-50',
    dark: 'bg-gray-900 text-white',
    glass: 'backdrop-blur-xl bg-white/90'
  };

  // Icons
  const userIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const emailIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );

  if (submitSuccess) {
    return (
      <div className={`p-8 rounded-2xl text-center ${variantStyles[variant]} ${className}`}>
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold mb-2 text-gray-900">Success!</h3>
        <p className="text-gray-600 mb-4">Check your email to download your free guide.</p>
        <p className="text-sm text-gray-500">
          You should receive it within the next 5 minutes. Don't forget to check your spam folder.
        </p>
      </div>
    );
  }

  return (
    <div className={`p-8 rounded-2xl shadow-xl ${variantStyles[variant]} ${className}`}>
      {/* Countdown Timer */}
      {showCountdown && timeLeft > 0 && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-red-700">Limited Time Offer!</p>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg font-bold text-red-700">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Offer Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-red-500 mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className={`text-2xl font-bold mb-2 ${variant === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {offerTitle}
        </h3>
        <p className={`${variant === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          {offerDescription}
        </p>
      </div>

      {/* What You'll Get */}
      <div className={`mb-6 p-4 rounded-lg ${variant === 'dark' ? 'bg-white/10' : 'bg-gray-50'}`}>
        <h4 className={`font-semibold mb-3 ${variant === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          What's Included:
        </h4>
        <ul className="space-y-2">
          {[
            '7 Proven strategies to boost your score',
            'Step-by-step action plan',
            'Credit bureau dispute templates',
            'Bonus: Credit monitoring checklist'
          ].map((item, index) => (
            <li key={index} className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className={`text-sm ${variant === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.submit && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-700">{errors.submit}</p>
          </div>
        )}

        <Input
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          error={errors.firstName}
          icon={userIcon}
          placeholder="Your First Name"
          required
          disabled={isSubmitting}
          variant={variant === 'dark' ? 'glass' : 'default'}
        />

        <Input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          icon={emailIcon}
          placeholder="Your Email Address"
          required
          disabled={isSubmitting}
          variant={variant === 'dark' ? 'glass' : 'default'}
        />

        {/* Terms Checkbox */}
        <div className="space-y-3">
          <label className="flex items-start cursor-pointer group">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="mt-1 w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-400"
              disabled={isSubmitting}
            />
            <span className={`ml-3 text-sm ${variant === 'dark' ? 'text-gray-300' : 'text-gray-600'} group-hover:text-gray-900`}>
              I agree to the{' '}
              <a href="/terms" className="text-yellow-500 hover:text-yellow-600 underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-yellow-500 hover:text-yellow-600 underline">
                Privacy Policy
              </a>
              *
            </span>
          </label>
          {errors.agreeToTerms && (
            <p className="text-sm text-red-600 ml-7">{errors.agreeToTerms}</p>
          )}

          {/* Marketing Consent */}
          <label className="flex items-start cursor-pointer group">
            <input
              type="checkbox"
              name="marketingConsent"
              checked={formData.marketingConsent}
              onChange={handleChange}
              className="mt-1 w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-400"
              disabled={isSubmitting}
            />
            <span className={`ml-3 text-sm ${variant === 'dark' ? 'text-gray-300' : 'text-gray-600'} group-hover:text-gray-900`}>
              Yes, I want to receive credit tips and exclusive offers
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            w-full px-8 py-4 rounded-lg font-semibold text-white
            bg-gradient-to-r from-yellow-400 to-red-500
            hover:from-yellow-500 hover:to-red-600
            transform transition-all duration-200
            hover:scale-[1.02] hover:shadow-xl
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            focus:outline-none focus:ring-4 focus:ring-yellow-400/50
            relative overflow-hidden
          `}
        >
          <span className="relative z-10">
            {isSubmitting ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Processing...</span>
              </span>
            ) : (
              <>
                Get My Free Guide
                <svg className="inline-block w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </>
            )}
          </span>
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </button>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center space-x-4 mt-4">
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secure</span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
            </svg>
            <span>No Spam</span>
          </div>
        </div>
      </form>
    </div>
  );
};

LeadCaptureForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  offerTitle: PropTypes.string,
  offerDescription: PropTypes.string,
  showCountdown: PropTypes.bool,
  countdownMinutes: PropTypes.number,
  variant: PropTypes.oneOf(['default', 'gradient', 'dark', 'glass']),
  className: PropTypes.string
};

export default LeadCaptureForm;