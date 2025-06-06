import React from 'react';

const Button = ({ 
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  onClick,
  type = 'button',
  className = '',
  ...props 
}) => {
  // Variant styles using the Credit Gyems Academy color scheme
  const variantClasses = {
    primary: `
      bg-gradient-to-r from-yellow-400 to-yellow-500 
      hover:from-yellow-500 hover:to-yellow-600
      text-slate-800 
      border-yellow-400
      shadow-md hover:shadow-lg
      font-semibold
    `,
    secondary: `
      bg-white 
      hover:bg-slate-50
      text-slate-700 
      border-slate-300
      shadow-sm hover:shadow-md
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-red-600
      hover:from-red-600 hover:to-red-700
      text-white
      border-red-500
      shadow-md hover:shadow-lg
      font-semibold
    `,
    outline: `
      bg-transparent
      hover:bg-slate-50
      text-slate-700
      border-slate-300
      hover:border-slate-400
    `,
    ghost: `
      bg-transparent
      hover:bg-slate-100
      text-slate-600
      border-transparent
    `
  };

  // Size styles
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };

  // Base classes
  const baseClasses = `
    inline-flex
    items-center
    justify-center
    border
    rounded-lg
    font-medium
    transition-all
    duration-200
    focus:outline-none
    focus:ring-2
    focus:ring-yellow-400
    focus:ring-offset-2
    disabled:opacity-50
    disabled:cursor-not-allowed
    disabled:hover:shadow-none
  `.replace(/\s+/g, ' ').trim();

  // Combine all classes
  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant] || variantClasses.primary}
    ${sizeClasses[size] || sizeClasses.md}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  // Loading spinner component
  const LoadingSpinner = () => (
    <svg 
      className="animate-spin -ml-1 mr-2 h-4 w-4" 
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
  );

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {!loading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;