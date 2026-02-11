import type { ReactNode } from 'react';
import { forwardRef } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'subtle';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ children, className = '', variant = 'default' }, ref) => {
  const variants = {
    default: 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700',
    elevated: 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-md',
    subtle: 'bg-gray-50/50 dark:bg-slate-800/50 border border-transparent',
  };

  return (
    <div ref={ref} className={`${variants[variant]} rounded-xl transition-all duration-200 ${className}`}>
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-5 border-b border-gray-100 dark:border-slate-700/50 ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-6 ${className}`}>
      {children}
    </div>
  );
}
