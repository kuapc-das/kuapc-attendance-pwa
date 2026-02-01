import React from 'react';
import { Haptics } from '../utils/haptics';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  disableHaptics?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  isLoading, 
  loadingText,
  variant = 'primary', 
  className = '', 
  disabled,
  disableHaptics = false,
  onClick,
  ...props 
}) => {
  const baseStyles = "w-full py-4 px-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.96] disabled:opacity-50 disabled:active:scale-100";
  
  const variants = {
    primary: "bg-[#1e3a8a] text-white shadow-xl shadow-blue-900/20 hover:bg-[#0f172a] border border-blue-400/10",
    secondary: "bg-white text-[#1e3a8a] border-2 border-slate-100 hover:border-blue-100 shadow-sm",
    danger: "bg-red-500 text-white shadow-xl shadow-red-900/20 hover:bg-red-600"
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disableHaptics) {
      Haptics.light();
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      onClick={handleClick}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {loadingText && <span>{loadingText}</span>}
        </>
      ) : children}
    </button>
  );
};