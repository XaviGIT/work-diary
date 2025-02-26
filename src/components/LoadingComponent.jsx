import React from 'react';

/**
 * Loading spinner component with different sizes
 */
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`${sizeClass} rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-black dark:border-t-white animate-spin`}></div>
    </div>
  );
};

/**
 * Loading overlay for blocking operations
 */
export const LoadingOverlay = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-50 flex flex-col items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-gray-800 dark:text-gray-200">{message}</p>
      </div>
    </div>
  );
};

/**
 * Button with loading state
 */
export const LoadingButton = ({
  isLoading,
  loadingText = 'Loading...',
  children,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      disabled={isLoading || disabled}
      className={`px-6 py-2 bg-black dark:bg-gray-700 text-white rounded
                 hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors
                 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center
                 ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
};