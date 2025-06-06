import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';

const Input = forwardRef(({
  label,
  error,
  success,
  hint,
  icon,
  rightIcon,
  type = 'text',
  variant = 'default',
  size = 'medium',
  fullWidth = true,
  required = false,
  disabled = false,
  className = '',
  containerClassName = '',
  labelClassName = '',
  id,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Generate unique ID if not provided
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  // Handle focus events
  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus && onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur && onBlur(e);
  };

  // Size classes
  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-3 text-base',
    large: 'px-5 py-4 text-lg'
  };

  // Icon size classes
  const iconSizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  // Base input styles
  const baseInputStyles = `
    w-full
    rounded-lg
    font-medium
    transition-all
    duration-200
    outline-none
    ${sizeClasses[size]}
    ${icon ? 'pl-12' : ''}
    ${rightIcon || type === 'password' ? 'pr-12' : ''}
    ${disabled ? 'cursor-not-allowed opacity-60' : ''}
  `;

  // Variant styles
  const variantStyles = {
    default: `
      bg-white
      border-2
      ${error ? 'border-red-500 focus:border-red-500' : ''}
      ${success ? 'border-green-500 focus:border-green-500' : ''}
      ${!error && !success ? 'border-gray-200 focus:border-yellow-400' : ''}
      ${isFocused && !error && !success ? 'shadow-lg shadow-yellow-400/20' : ''}
      placeholder-gray-400
    `,
    filled: `
      bg-gray-100
      border-2
      border-transparent
      ${error ? 'bg-red-50 border-red-500' : ''}
      ${success ? 'bg-green-50 border-green-500' : ''}
      ${isFocused && !error && !success ? 'bg-gray-50 border-yellow-400 shadow-lg shadow-yellow-400/20' : ''}
      placeholder-gray-500
    `,
    underlined: `
      bg-transparent
      border-b-2
      rounded-none
      px-0
      ${error ? 'border-red-500' : ''}
      ${success ? 'border-green-500' : ''}
      ${!error && !success ? 'border-gray-300 focus:border-yellow-400' : ''}
      placeholder-gray-400
    `,
    glass: `
      backdrop-blur-lg
      bg-white/10
      border
      border-white/20
      text-white
      placeholder-white/60
      ${isFocused ? 'bg-white/20 border-white/40 shadow-lg' : ''}
    `
  };

  // Label styles
  const labelStyles = `
    block
    text-sm
    font-semibold
    mb-2
    ${error ? 'text-red-600' : ''}
    ${success ? 'text-green-600' : ''}
    ${!error && !success ? 'text-gray-700' : ''}
    ${disabled ? 'opacity-60' : ''}
    ${labelClassName}
  `;

  // Container styles
  const containerStyles = `
    ${fullWidth ? 'w-full' : ''}
    ${containerClassName}
  `;

  // Determine input type for password visibility toggle
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={containerStyles}>
      {label && (
        <label htmlFor={inputId} className={labelStyles}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Left Icon */}
        {icon && (
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${error ? 'text-red-500' : success ? 'text-green-500' : 'text-gray-400'} ${iconSizeClasses[size]}`}>
            {icon}
          </div>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`${baseInputStyles} ${variantStyles[variant]} ${className}`}
          {...props}
        />

        {/* Right Icon / Password Toggle */}
        {(rightIcon || type === 'password') && (
          <div className={`absolute right-4 top-1/2 -translate-y-1/2 ${error ? 'text-red-500' : success ? 'text-green-500' : 'text-gray-400'} ${iconSizeClasses[size]}`}>
            {type === 'password' ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className={iconSizeClasses[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className={iconSizeClasses[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            ) : rightIcon}
          </div>
        )}

        {/* Focus Ring Animation */}
        {isFocused && variant !== 'underlined' && (
          <div className="absolute inset-0 rounded-lg pointer-events-none">
            <div className="absolute inset-0 rounded-lg animate-pulse bg-gradient-to-r from-yellow-400/20 to-red-500/20" />
          </div>
        )}
      </div>

      {/* Helper Text */}
      {(error || success || hint) && (
        <p className={`mt-2 text-sm ${error ? 'text-red-600' : success ? 'text-green-600' : 'text-gray-500'}`}>
          {error || success || hint}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  success: PropTypes.string,
  hint: PropTypes.string,
  icon: PropTypes.node,
  rightIcon: PropTypes.node,
  type: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'filled', 'underlined', 'glass']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullWidth: PropTypes.bool,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
  labelClassName: PropTypes.string,
  id: PropTypes.string,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func
};

export default Input;