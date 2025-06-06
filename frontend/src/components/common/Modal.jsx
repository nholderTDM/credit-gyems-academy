import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'medium',
  variant = 'default',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  centered = true,
  className = '',
  backdropClassName = '',
  contentClassName = '',
  footer,
  header,
  animate = true,
  glass = false
}) => {
  const modalRef = useRef(null);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (closeOnEscape && e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Size classes
  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl',
    fullscreen: 'w-full h-full max-w-none m-0'
  };

  // Variant styles
  const variantStyles = {
    default: 'bg-white shadow-2xl',
    primary: 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white',
    secondary: 'bg-gradient-to-br from-red-500 to-red-600 text-white',
    navy: 'bg-gradient-to-br from-blue-900 to-blue-950 text-white',
    minimal: 'bg-white shadow-lg',
    dark: 'bg-gray-900 text-white'
  };

  // Glass morphism styles
  const glassStyles = glass ? `
    backdrop-blur-xl
    bg-white/90
    border border-white/20
    shadow-2xl
  ` : '';

  // Animation classes
  const backdropAnimation = animate ? `
    ${isOpen ? 'opacity-100' : 'opacity-0'}
    transition-opacity duration-300
  ` : isOpen ? 'opacity-100' : 'opacity-0';

  const modalAnimation = animate ? `
    ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
    transition-all duration-300
    ${centered && size !== 'fullscreen' ? 'transform' : ''}
  ` : isOpen ? 'opacity-100' : 'opacity-0';

  if (!isOpen) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50
        ${centered ? 'flex items-center justify-center' : ''}
        p-4
        ${backdropAnimation}
        ${backdropClassName}
      `}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className={`
          relative
          ${size !== 'fullscreen' ? 'rounded-2xl' : ''}
          ${sizeClasses[size]}
          ${glass ? glassStyles : variantStyles[variant]}
          ${modalAnimation}
          ${size !== 'fullscreen' ? 'max-h-[90vh] overflow-hidden' : ''}
          ${className}
        `}
      >
        {/* Close Button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className={`
              absolute top-4 right-4 z-10
              w-10 h-10
              rounded-full
              flex items-center justify-center
              transition-all duration-200
              ${variant === 'default' || variant === 'minimal' || glass ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-white/20 hover:bg-white/30 text-white'}
              hover:scale-110
              focus:outline-none focus:ring-2 focus:ring-yellow-400
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Header */}
        {(header || title) && (
          <div className={`
            px-6 py-5
            border-b
            ${variant === 'default' || variant === 'minimal' || glass ? 'border-gray-200' : 'border-white/20'}
          `}>
            {header || (
              <h2 className={`
                text-2xl font-bold
                ${variant === 'default' || variant === 'minimal' || glass ? 'text-gray-900' : ''}
              `}>
                {title}
              </h2>
            )}
          </div>
        )}

        {/* Body */}
        <div className={`
          ${size !== 'fullscreen' ? 'overflow-y-auto max-h-[calc(90vh-8rem)]' : 'overflow-auto h-full'}
          ${!header && !title && !footer ? 'p-6' : 'px-6 py-4'}
          ${contentClassName}
        `}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={`
            px-6 py-4
            border-t
            ${variant === 'default' || variant === 'minimal' || glass ? 'border-gray-200' : 'border-white/20'}
            ${glass ? 'bg-white/50 backdrop-blur-sm' : ''}
          `}>
            {footer}
          </div>
        )}

        {/* Decorative elements */}
        {glass && (
          <>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-red-500/20 rounded-full blur-3xl" />
          </>
        )}
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xl', 'full', 'fullscreen']),
  variant: PropTypes.oneOf(['default', 'primary', 'secondary', 'navy', 'minimal', 'dark']),
  closeOnBackdropClick: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  centered: PropTypes.bool,
  className: PropTypes.string,
  backdropClassName: PropTypes.string,
  contentClassName: PropTypes.string,
  footer: PropTypes.node,
  header: PropTypes.node,
  animate: PropTypes.bool,
  glass: PropTypes.bool
};

// Sub-components for better composition
Modal.Header = ({ children, className = '' }) => (
  <div className={`px-6 py-5 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

Modal.Body = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

Modal.Footer = ({ children, className = '', align = 'right' }) => (
  <div className={`
    px-6 py-4 border-t border-gray-200 flex
    ${align === 'right' ? 'justify-end' : ''}
    ${align === 'left' ? 'justify-start' : ''}
    ${align === 'center' ? 'justify-center' : ''}
    ${align === 'between' ? 'justify-between' : ''}
    gap-3
    ${className}
  `}>
    {children}
  </div>
);

Modal.Header.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

Modal.Body.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

Modal.Footer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  align: PropTypes.oneOf(['left', 'right', 'center', 'between'])
};

export default Modal;