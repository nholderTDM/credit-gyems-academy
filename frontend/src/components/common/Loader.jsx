import React from 'react';

const Loader = ({
  size = 'md',
  fullScreen = false,
  message
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-3',
    lg: 'h-16 w-16 border-4'
  };
  
  // Container classes
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50'
    : 'flex flex-col items-center justify-center py-16';
  
  return (
    <div className={containerClasses}>
      <div className={`${sizeClasses[size]} rounded-full animate-spin border-t-transparent border-yellow-500`}></div>
      {message && (
        <p className="mt-4 text-center text-slate-600">{message}</p>
      )}
    </div>
  );
};

export default Loader;