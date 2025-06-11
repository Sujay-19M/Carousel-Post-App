
import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  // Add any other specific props like 'variant', 'size' if needed
}

export const IconButton: React.FC<IconButtonProps> = ({ children, className, ...props }) => {
  return (
    <button
      {...props}
      type="button" // Default to type="button" to prevent form submissions
      className={`p-2 rounded-full text-slate-300 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors duration-150 ${className || ''}`}
    >
      {children}
    </button>
  );
};
    