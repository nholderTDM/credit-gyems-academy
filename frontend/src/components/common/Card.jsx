import React from 'react';
import PropTypes from 'prop-types';

const Card = ({
  children,
  className = '',
  variant = 'default',
  hover = true,
  gradient = false,
  glass = false,
  padding = 'normal',
  onClick,
  as = 'div',
  ...props
}) => {
  const Component = as;

  // Padding classes based on size
  const paddingClasses = {
    none: '',
    small: 'p-4',
    normal: 'p-6',
    large: 'p-8',
    xl: 'p-10'
  };

  // Base styles for all cards
  const baseStyles = `
    relative
    rounded-xl
    transition-all
    duration-300
    ${paddingClasses[padding]}
  `;

  // Variant styles
  const variantStyles = {
    default: `
      bg-white
      border border-gray-100
      ${hover ? 'hover:shadow-xl hover:-translate-y-1' : ''}
      shadow-lg
    `,
    primary: `
      bg-gradient-to-br from-yellow-400 to-yellow-500
      text-white
      ${hover ? 'hover:shadow-2xl hover:shadow-yellow-500/25 hover:-translate-y-1' : ''}
      shadow-lg
    `,
    secondary: `
      bg-gradient-to-br from-red-500 to-red-600
      text-white
      ${hover ? 'hover:shadow-2xl hover:shadow-red-500/25 hover:-translate-y-1' : ''}
      shadow-lg
    `,
    navy: `
      bg-gradient-to-br from-blue-900 to-blue-950
      text-white
      ${hover ? 'hover:shadow-2xl hover:shadow-blue-900/25 hover:-translate-y-1' : ''}
      shadow-lg
    `,
    outlined: `
      bg-transparent
      border-2 border-gray-200
      ${hover ? 'hover:border-yellow-400 hover:shadow-lg hover:-translate-y-1' : ''}
    `,
    elevated: `
      bg-white
      ${hover ? 'hover:shadow-2xl hover:-translate-y-2' : ''}
      shadow-xl
    `
  };

  // Glass morphism effect
  const glassStyles = glass ? `
    backdrop-blur-lg
    bg-white/10
    border border-white/20
    ${hover ? 'hover:bg-white/20' : ''}
  ` : '';

  // Gradient background option
  const gradientStyles = gradient ? `
    bg-gradient-to-br
    ${variant === 'default' ? 'from-white via-gray-50 to-gray-100' : ''}
  ` : '';

  // Click handler styles
  const clickableStyles = onClick ? 'cursor-pointer' : '';

  // Combine all styles
  const cardStyles = `
    ${baseStyles}
    ${glass ? glassStyles : variantStyles[variant]}
    ${gradientStyles}
    ${clickableStyles}
    ${className}
  `;

  return (
    <Component
      className={cardStyles}
      onClick={onClick}
      {...props}
    >
      {/* Decorative gradient border for premium feel */}
      {variant === 'default' && !glass && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-400 via-red-500 to-teal-500 opacity-0 hover:opacity-10 transition-opacity duration-300 pointer-events-none" />
      )}
      
      {/* Glass morphism overlay */}
      {glass && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-white/10 pointer-events-none" />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </Component>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'primary', 'secondary', 'navy', 'outlined', 'elevated']),
  hover: PropTypes.bool,
  gradient: PropTypes.bool,
  glass: PropTypes.bool,
  padding: PropTypes.oneOf(['none', 'small', 'normal', 'large', 'xl']),
  onClick: PropTypes.func,
  as: PropTypes.elementType
};

// Sub-components for better composition
Card.Header = ({ children, className = '', separator = true }) => (
  <div className={`${separator ? 'border-b border-gray-100 pb-4 mb-4' : ''} ${className}`}>
    {children}
  </div>
);

Card.Body = ({ children, className = '' }) => (
  <div className={`${className}`}>
    {children}
  </div>
);

Card.Footer = ({ children, className = '', separator = true }) => (
  <div className={`${separator ? 'border-t border-gray-100 pt-4 mt-4' : ''} ${className}`}>
    {children}
  </div>
);

Card.Header.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  separator: PropTypes.bool
};

Card.Body.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

Card.Footer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  separator: PropTypes.bool
};

export default Card;