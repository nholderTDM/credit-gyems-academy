import React from 'react';
import PropTypes from 'prop-types';

const LoadingSpinner = ({
  size = 'medium',
  variant = 'default',
  color = 'primary',
  text,
  fullScreen = false,
  overlay = false,
  className = '',
  textClassName = ''
}) => {
  // Size classes
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  // Text size classes
  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    xl: 'text-xl'
  };

  // Color classes based on brand colors
  const colorClasses = {
    primary: 'text-yellow-400',
    secondary: 'text-red-500',
    navy: 'text-blue-900',
    teal: 'text-teal-500',
    white: 'text-white',
    gray: 'text-gray-400',
    gradient: 'text-transparent bg-gradient-to-r from-yellow-400 to-red-500'
  };

  // Spinner variants
  const renderSpinner = () => {
    switch (variant) {
      case 'default':
        return (
          <div className={`${sizeClasses[size]} ${className}`}>
            <svg
              className={`animate-spin ${colorClasses[color]}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        );

      case 'dots':
        return (
          <div className={`flex space-x-2 ${className}`}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`
                  ${size === 'small' ? 'w-2 h-2' : ''}
                  ${size === 'medium' ? 'w-3 h-3' : ''}
                  ${size === 'large' ? 'w-4 h-4' : ''}
                  ${size === 'xl' ? 'w-6 h-6' : ''}
                  ${color === 'gradient' ? 'bg-gradient-to-r from-yellow-400 to-red-500' : ''}
                  ${color !== 'gradient' ? `bg-current ${colorClasses[color]}` : ''}
                  rounded-full
                  animate-bounce
                `}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div className={`relative ${sizeClasses[size]} ${className}`}>
            <div
              className={`
                absolute inset-0 rounded-full
                ${color === 'gradient' ? 'bg-gradient-to-r from-yellow-400 to-red-500' : ''}
                ${color !== 'gradient' ? `bg-current ${colorClasses[color]}` : ''}
                animate-ping
              `}
            />
            <div
              className={`
                relative rounded-full
                ${color === 'gradient' ? 'bg-gradient-to-r from-yellow-400 to-red-500' : ''}
                ${color !== 'gradient' ? `bg-current ${colorClasses[color]}` : ''}
              `}
            />
          </div>
        );

      case 'ring':
        return (
          <div className={`${sizeClasses[size]} ${className}`}>
            <div className="relative w-full h-full">
              <div
                className={`
                  absolute inset-0 rounded-full
                  border-4 border-t-transparent
                  ${color === 'gradient' ? 'border-yellow-400' : ''}
                  ${color !== 'gradient' ? `border-current ${colorClasses[color]}` : ''}
                  animate-spin
                `}
              />
              <div
                className={`
                  absolute inset-2 rounded-full
                  border-4 border-b-transparent
                  ${color === 'gradient' ? 'border-red-500' : ''}
                  ${color !== 'gradient' ? `border-current ${colorClasses[color]} opacity-50` : ''}
                  animate-spin
                `}
                style={{ animationDirection: 'reverse', animationDuration: '1s' }}
              />
            </div>
          </div>
        );

      case 'bars':
        return (
          <div className={`flex space-x-1 ${className}`}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`
                  ${size === 'small' ? 'w-1 h-6' : ''}
                  ${size === 'medium' ? 'w-1.5 h-8' : ''}
                  ${size === 'large' ? 'w-2 h-12' : ''}
                  ${size === 'xl' ? 'w-3 h-16' : ''}
                  ${color === 'gradient' ? 'bg-gradient-to-t from-yellow-400 to-red-500' : ''}
                  ${color !== 'gradient' ? `bg-current ${colorClasses[color]}` : ''}
                  rounded-full
                  animate-pulse
                `}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  transform: `scaleY(${0.4 + Math.sin((i / 4) * Math.PI) * 0.6})`
                }}
              />
            ))}
          </div>
        );

      case 'logo':
        // Custom spinner using brand colors
        return (
          <div className={`relative ${sizeClasses[size]} ${className}`}>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-red-500 animate-spin" />
            <div className="absolute inset-1 rounded-full bg-white" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-yellow-400 to-red-500 animate-pulse" />
          </div>
        );

      default:
        return null;
    }
  };

  // Container for full screen or overlay
  const spinnerContent = (
    <div className={`
      flex flex-col items-center justify-center
      ${fullScreen || overlay ? 'space-y-4' : ''}
      ${!fullScreen && !overlay ? 'inline-flex' : ''}
    `}>
      {renderSpinner()}
      {text && (
        <p className={`
          ${textSizeClasses[size]}
          font-medium
          ${color === 'gradient' ? 'bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent' : ''}
          ${color !== 'gradient' ? colorClasses[color] : ''}
          ${textClassName}
        `}>
          {text}
        </p>
      )}
    </div>
  );

  // Full screen loading
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        {spinnerContent}
      </div>
    );
  }

  // Overlay loading
  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          {spinnerContent}
        </div>
      </div>
    );
  }

  // Inline loading
  return spinnerContent;
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xl']),
  variant: PropTypes.oneOf(['default', 'dots', 'pulse', 'ring', 'bars', 'logo']),
  color: PropTypes.oneOf(['primary', 'secondary', 'navy', 'teal', 'white', 'gray', 'gradient']),
  text: PropTypes.string,
  fullScreen: PropTypes.bool,
  overlay: PropTypes.bool,
  className: PropTypes.string,
  textClassName: PropTypes.string
};

// Skeleton loader component for content loading
export const SkeletonLoader = ({
  width = '100%',
  height = '20px',
  variant = 'text',
  className = '',
  count = 1,
  spacing = 'mb-2'
}) => {
  const variants = {
    text: 'rounded',
    title: 'rounded h-8',
    avatar: 'rounded-full',
    thumbnail: 'rounded-lg',
    card: 'rounded-xl',
    button: 'rounded-lg'
  };

  const baseClasses = `
    animate-pulse
    bg-gradient-to-r
    from-gray-200
    via-gray-300
    to-gray-200
    background-size-200
    ${variants[variant]}
    ${className}
  `;

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${baseClasses} ${index < count - 1 ? spacing : ''}`}
          style={{
            width: variant === 'avatar' ? height : width,
            height: height,
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      ))}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </>
  );
};

SkeletonLoader.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  variant: PropTypes.oneOf(['text', 'title', 'avatar', 'thumbnail', 'card', 'button']),
  className: PropTypes.string,
  count: PropTypes.number,
  spacing: PropTypes.string
};

export default LoadingSpinner;