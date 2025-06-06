import React, { useState } from 'react';
import PropTypes from 'prop-types';

const NewsletterForm = ({
  onSubmit,
  title = 'Stay Updated',
  description = 'Get weekly credit tips and exclusive offers delivered to your inbox',
  layout = 'horizontal',
  variant = 'default',
  showBenefits = true,
  className = ''
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Validate email
  const validateEmail = (email) => {
    if (!email.trim()) {
      return 'Email is required';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit({ email });
      setSubmitSuccess(true);
      setEmail('');
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch  {
      setError('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  // Variant styles
  const variantStyles = {
    default: 'bg-white border border-gray-200',
    gradient: 'bg-gradient-to-br from-yellow-50 to-red-50 border-0',
    dark: 'bg-gray-900 text-white border-0',
    glass: 'backdrop-blur-xl bg-white/90 border border-white/20',
    minimal: 'bg-transparent border-0'
  };

  // Benefits list
  const benefits = [
    'Weekly credit improvement tips',
    'Exclusive member discounts',
    'Early access to new courses',
    'Free resources and guides'
  ];

  // Success state
  if (submitSuccess && layout !== 'inline') {
    return (
      <div className={`p-6 rounded-xl text-center ${variantStyles[variant]} ${className}`}>
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className={`text-xl font-bold mb-2 ${variant === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Welcome to Credit Gyems!
        </h3>
        <p className={`${variant === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Check your inbox to confirm your subscription.
        </p>
      </div>
    );
  }

  // Inline layout
  if (layout === 'inline') {
    return (
      <form onSubmit={handleSubmit} className={`${className}`}>
        {submitSuccess ? (
          <div className="flex items-center space-x-2 text-green-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">Successfully subscribed!</span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="email"
                value={email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`
                  w-full px-4 py-3 rounded-lg font-medium
                  transition-all duration-200 outline-none
                  ${error ? 'border-2 border-red-500' : 'border-2 border-gray-200 focus:border-yellow-400'}
                  focus:shadow-lg focus:shadow-yellow-400/20
                  placeholder-gray-400
                `}
                disabled={isSubmitting}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                px-6 py-3 rounded-lg font-semibold text-white
                bg-gradient-to-r from-yellow-400 to-red-500
                hover:from-yellow-500 hover:to-red-600
                transform transition-all duration-200
                hover:scale-[1.02] hover:shadow-xl
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                focus:outline-none focus:ring-4 focus:ring-yellow-400/50
                whitespace-nowrap
              `}
            >
              {isSubmitting ? (
                <svg className="animate-spin h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                'Subscribe'
              )}
            </button>
          </div>
        )}
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </form>
    );
  }

  // Standard layouts (horizontal/vertical)
  return (
    <div className={`p-8 rounded-2xl shadow-lg ${variantStyles[variant]} ${className}`}>
      <div className={`${layout === 'horizontal' ? 'lg:flex lg:items-center lg:space-x-8' : ''}`}>
        {/* Content Section */}
        <div className={`${layout === 'horizontal' ? 'lg:flex-1' : 'text-center'} mb-6 lg:mb-0`}>
          <h3 className={`text-2xl font-bold mb-2 ${variant === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>
          <p className={`${variant === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
            {description}
          </p>
          
          {showBenefits && (
            <ul className={`${layout === 'vertical' ? 'text-left max-w-sm mx-auto' : ''} space-y-2`}>
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className={`text-sm ${variant === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Form Section */}
        <div className={`${layout === 'horizontal' ? 'lg:w-96' : 'max-w-md mx-auto'}`}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={handleChange}
                placeholder="Enter your email address"
                className={`
                  w-full px-12 py-4 rounded-lg font-medium text-base
                  transition-all duration-200 outline-none
                  ${variant === 'dark' ? 'bg-white/10 text-white placeholder-white/60 border-white/20' : 'bg-white'}
                  ${error ? 'border-2 border-red-500' : 'border-2 border-gray-200 focus:border-yellow-400'}
                  focus:shadow-lg focus:shadow-yellow-400/20
                `}
                disabled={isSubmitting}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className={`w-5 h-5 ${variant === 'dark' ? 'text-white/40' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

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
              `}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Subscribing...</span>
                </span>
              ) : (
                <>
                  Join Our Community
                  <svg className="inline-block w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>

            <p className={`text-xs text-center ${variant === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              We respect your privacy. Unsubscribe at any time.
            </p>
          </form>
        </div>
      </div>

      {/* Decorative Elements */}
      {variant === 'gradient' && (
        <>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
        </>
      )}
    </div>
  );
};

NewsletterForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  layout: PropTypes.oneOf(['horizontal', 'vertical', 'inline']),
  variant: PropTypes.oneOf(['default', 'gradient', 'dark', 'glass', 'minimal']),
  showBenefits: PropTypes.bool,
  className: PropTypes.string
};

export default NewsletterForm;