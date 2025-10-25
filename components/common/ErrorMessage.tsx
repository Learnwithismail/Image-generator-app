import React from 'react';
import { ExclamationTriangleIcon } from '../icons/ExclamationTriangleIcon';

interface ErrorMessageProps {
  message: string | null;
  size?: 'sm' | 'md';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, size = 'md' }) => {
  if (!message) {
    return null;
  }

  const sizeClasses = {
    sm: 'px-3 py-2 text-xs rounded-md',
    md: 'px-4 py-3 text-sm rounded-lg',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
  };

  const textContainerClasses = {
    sm: 'text-xs',
    md: 'text-sm',
  };

  return (
    <div className={`bg-red-900/30 border border-red-500/50 text-red-300 relative flex items-start gap-3 ${sizeClasses[size]}`} role="alert">
      <ExclamationTriangleIcon className={`${iconSizeClasses[size]} mt-0.5 text-red-400 flex-shrink-0`} />
      <div className={textContainerClasses[size]}>
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{message}</span>
      </div>
    </div>
  );
};
