import React from 'react';
import Button from './Button';

const ErrorDisplay = ({ 
  message = 'An error occurred',
  title = 'Something went wrong',
  actionText = 'Try again',
  onAction = null,
  showIcon = true,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      {showIcon && (
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-red-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
        </div>
      )}
      
      <div className="max-w-md">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          {title}
        </h3>
        
        <p className="text-slate-600 mb-6 leading-relaxed">
          {message}
        </p>
        
        {onAction && (
          <Button
            variant="primary"
            onClick={onAction}
            className="min-w-[120px]"
          >
            {actionText}
          </Button>
        )}
      </div>
    </div>
  );
};

// Additional preset error types for common scenarios
export const NetworkError = ({ onRetry }) => (
  <ErrorDisplay
    title="Connection Problem"
    message="Unable to connect to the server. Please check your internet connection and try again."
    actionText="Retry"
    onAction={onRetry}
  />
);

export const NotFoundError = ({ onGoBack }) => (
  <ErrorDisplay
    title="Page Not Found"
    message="The page you're looking for doesn't exist or has been moved."
    actionText="Go Back"
    onAction={onGoBack}
  />
);

export const UnauthorizedError = ({ onLogin }) => (
  <ErrorDisplay
    title="Access Denied"
    message="You need to be logged in to view this content."
    actionText="Sign In"
    onAction={onLogin}
  />
);

export const ServerError = ({ onRetry }) => (
  <ErrorDisplay
    title="Server Error"
    message="Something went wrong on our end. Please try again in a few moments."
    actionText="Try Again"
    onAction={onRetry}
  />
);

export default ErrorDisplay;