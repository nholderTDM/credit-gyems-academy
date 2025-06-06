import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Input from '../common/Input';

const CheckoutForm = ({
  onSubmit,
  orderSummary,
  showBillingAddress = true,
  showDiscountCode = true,
  supportedPaymentMethods = ['card', 'klarna', 'afterpay'],
  className = ''
}) => {
  const [formData, setFormData] = useState({
    // Personal Information
    email: '',
    firstName: '',
    lastName: '',
    
    // Payment Method
    paymentMethod: 'card',
    
    // Card Details (for card payment)
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    
    // Billing Address
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    
    // Additional
    discountCode: '',
    saveInfo: false,
    agreeToTerms: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry date
  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + (v.length > 2 ? '/' + v.slice(2, 4) : '');
    }
    return v;
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Payment method specific validation
    if (formData.paymentMethod === 'card') {
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      } else if (formData.cardNumber.replace(/\s/g, '').length < 16) {
        newErrors.cardNumber = 'Please enter a valid card number';
      }

      if (!formData.cardExpiry.trim()) {
        newErrors.cardExpiry = 'Expiry date is required';
      } else if (!/^\d{2}\/\d{2}$/.test(formData.cardExpiry)) {
        newErrors.cardExpiry = 'Use MM/YY format';
      }

      if (!formData.cardCvc.trim()) {
        newErrors.cardCvc = 'CVC is required';
      } else if (!/^\d{3,4}$/.test(formData.cardCvc)) {
        newErrors.cardCvc = 'Invalid CVC';
      }
    }

    // Billing address validation
    if (showBillingAddress) {
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required';
      }
      if (!formData.city.trim()) {
        newErrors.city = 'City is required';
      }
      if (!formData.state.trim()) {
        newErrors.state = 'State is required';
      }
      if (!formData.zipCode.trim()) {
        newErrors.zipCode = 'ZIP code is required';
      }
    }

    // Terms agreement
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms to continue';
    }

    return newErrors;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let formattedValue = value;

    // Format specific fields
    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'cardExpiry') {
      formattedValue = formatExpiry(value);
    } else if (name === 'cardCvc') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : formattedValue
    }));

    // Clear error when user makes changes
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Apply discount code
  const applyDiscount = () => {
    if (formData.discountCode.toUpperCase() === 'CREDIT10') {
      setDiscountAmount(orderSummary.subtotal * 0.1);
      setDiscountApplied(true);
    } else {
      setErrors(prev => ({ ...prev, discountCode: 'Invalid discount code' }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to first error
      const firstError = document.querySelector('.text-red-600');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        ...formData,
        discountAmount,
        total: orderSummary.subtotal + orderSummary.tax - discountAmount
      });
    } catch  {
      setErrors({ submit: 'Payment failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Payment method icons
  const paymentMethodIcons = {
    card: (
      <div className="flex space-x-2">
        <img src="/images/visa.svg" alt="Visa" className="h-6" />
        <img src="/images/mastercard.svg" alt="Mastercard" className="h-6" />
        <img src="/images/amex.svg" alt="Amex" className="h-6" />
      </div>
    ),
    klarna: <img src="/images/klarna.svg" alt="Klarna" className="h-6" />,
    afterpay: <img src="/images/afterpay.svg" alt="AfterPay" className="h-6" />
  };

  return (
    <div className={`${className}`}>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="john@example.com"
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              required
              disabled={isSubmitting}
            />
            <Input
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Payment Method Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
          <div className="space-y-3">
            {supportedPaymentMethods.map((method) => (
              <label
                key={method}
                className={`
                  relative flex items-center justify-between p-4 rounded-lg cursor-pointer
                  transition-all duration-200 border-2
                  ${formData.paymentMethod === method 
                    ? 'border-yellow-400 bg-yellow-50' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={formData.paymentMethod === method}
                    onChange={handleChange}
                    className="sr-only"
                    disabled={isSubmitting}
                  />
                  <div className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${formData.paymentMethod === method 
                      ? 'border-yellow-400' 
                      : 'border-gray-300'
                    }
                  `}>
                    {formData.paymentMethod === method && (
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    )}
                  </div>
                  <span className="font-medium capitalize">
                    {method === 'card' ? 'Credit/Debit Card' : method}
                  </span>
                </div>
                {paymentMethodIcons[method]}
              </label>
            ))}
          </div>
        </div>

        {/* Card Details (conditional) */}
        {formData.paymentMethod === 'card' && (
          <div className="space-y-4 animate-fadeIn">
            <Input
              label="Card Number"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleChange}
              error={errors.cardNumber}
              placeholder="1234 5678 9012 3456"
              maxLength="19"
              required
              disabled={isSubmitting}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Expiry Date"
                name="cardExpiry"
                value={formData.cardExpiry}
                onChange={handleChange}
                error={errors.cardExpiry}
                placeholder="MM/YY"
                maxLength="5"
                required
                disabled={isSubmitting}
              />
              <Input
                label="CVC"
                name="cardCvc"
                value={formData.cardCvc}
                onChange={handleChange}
                error={errors.cardCvc}
                placeholder="123"
                maxLength="4"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
        )}

        {/* Alternative Payment Message */}
        {formData.paymentMethod !== 'card' && (
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 animate-fadeIn">
            <p className="text-sm text-blue-700">
              You'll be redirected to {formData.paymentMethod === 'klarna' ? 'Klarna' : 'AfterPay'} to complete your purchase.
            </p>
          </div>
        )}

        {/* Billing Address */}
        {showBillingAddress && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h3>
            <div className="space-y-4">
              <Input
                label="Street Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                error={errors.address}
                placeholder="123 Main St"
                required
                disabled={isSubmitting}
              />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Input
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  error={errors.city}
                  required
                  disabled={isSubmitting}
                />
                <Input
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  error={errors.state}
                  placeholder="CA"
                  maxLength="2"
                  required
                  disabled={isSubmitting}
                />
                <Input
                  label="ZIP Code"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  error={errors.zipCode}
                  placeholder="12345"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        )}

        {/* Discount Code */}
        {showDiscountCode && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Discount Code</h3>
            <div className="flex space-x-3">
              <Input
                name="discountCode"
                value={formData.discountCode}
                onChange={handleChange}
                error={errors.discountCode}
                placeholder="Enter code"
                disabled={isSubmitting || discountApplied}
                containerClassName="flex-1"
              />
              <button
                type="button"
                onClick={applyDiscount}
                disabled={!formData.discountCode || isSubmitting || discountApplied}
                className={`
                  px-6 py-3 rounded-lg font-medium
                  transition-all duration-200
                  ${discountApplied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {discountApplied ? 'Applied!' : 'Apply'}
              </button>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${orderSummary.subtotal.toFixed(2)}</span>
            </div>
            {discountApplied && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Tax</span>
              <span>${orderSummary.tax.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between text-lg font-semibold text-gray-900">
                <span>Total</span>
                <span>${(orderSummary.subtotal + orderSummary.tax - discountAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Terms and Submit */}
        <div className="space-y-4">
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="mt-1 w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-400"
              disabled={isSubmitting}
            />
            <span className="ml-3 text-sm text-gray-600">
              I agree to the{' '}
              <a href="/terms" className="text-yellow-500 hover:text-yellow-600 underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-yellow-500 hover:text-yellow-600 underline">
                Privacy Policy
              </a>
            </span>
          </label>
          {errors.agreeToTerms && (
            <p className="text-sm text-red-600 ml-7">{errors.agreeToTerms}</p>
          )}

          {errors.submit && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-red-700">{errors.submit}</p>
            </div>
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
                <span>Processing...</span>
              </span>
            ) : (
              <>
                Complete Purchase
                <svg className="inline-block w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </>
            )}
          </button>

          {/* Security Badge */}
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secure checkout powered by Stripe</span>
          </div>
        </div>
      </form>
    </div>
  );
};

CheckoutForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  orderSummary: PropTypes.shape({
    subtotal: PropTypes.number.isRequired,
    tax: PropTypes.number.isRequired
  }).isRequired,
  showBillingAddress: PropTypes.bool,
  showDiscountCode: PropTypes.bool,
  supportedPaymentMethods: PropTypes.arrayOf(PropTypes.oneOf(['card', 'klarna', 'afterpay'])),
  className: PropTypes.string
};

export default CheckoutForm;