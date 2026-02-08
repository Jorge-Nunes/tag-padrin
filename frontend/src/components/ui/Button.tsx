import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'strong';
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm',
    secondary: 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 active:bg-gray-100 dark:bg-slate-800 dark:text-gray-200 dark:border-slate-700 dark:hover:bg-slate-750',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm',
    strong: 'bg-gray-800 text-white hover:bg-gray-900 active:scale-95 shadow-md dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white',
  };

  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs rounded-md',
    sm: 'px-3.5 py-2 text-sm rounded-md',
    md: 'px-5 py-2.5 text-base rounded-md',
    lg: 'px-8 py-3.5 text-lg rounded-md',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
