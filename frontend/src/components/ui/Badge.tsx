import { colors, borders } from '../../design-tokens';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'active' | 'inactive' | 'warning' | 'danger' | 'success' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'info', className = '' }: BadgeProps) {
  const variantStyles = colors.status[variant];

  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 text-xs font-semibold
        ${variantStyles.bg}
        ${variantStyles.text}
        ${variantStyles.border}
        border ${borders.badge}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
