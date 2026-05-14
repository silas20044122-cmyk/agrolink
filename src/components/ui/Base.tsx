import { motion } from 'motion/react';
import { ReactNode } from 'react';
import { cn } from '@/src/lib/utils';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'style'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  isLoading,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-primary-fresh text-white hover:bg-primary-dark shadow-md font-bold',
    secondary: 'bg-primary-dark text-white hover:bg-opacity-90 shadow-sm',
    accent: 'bg-accent-amber text-white hover:bg-opacity-90 shadow-sm',
    outline: 'border border-gray-200 text-gray-600 hover:bg-gray-50',
    ghost: 'text-gray-500 hover:bg-gray-50',
    danger: 'bg-accent-red text-white hover:bg-opacity-90 shadow-sm',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm font-bold',
    lg: 'px-5 py-2.5 text-sm font-bold',
    icon: 'p-2',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed outline-none select-none',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading}
      {...(props as any)}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : children}
    </motion.button>
  );
}

export function Card({ children, className, hoverable, onClick }: { children: ReactNode, className?: string, hoverable?: boolean, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
      'bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300',
      hoverable && 'hover:shadow-md hover:-translate-y-0.5',
      className
    )}>
      {children}
    </div>
  );
}

export function Input({ label, error, className, ...props }: { label?: string, error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="w-full space-y-1.5">
      {label && <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">{label}</label>}
      <input
        className={cn(
          'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-fresh focus:border-transparent transition-all outline-none text-sm',
          error && 'border-accent-red focus:ring-accent-red',
          className
        )}
        {...props}
      />
      {error && <p className="text-[10px] text-accent-red font-medium ml-1">{error}</p>}
    </div>
  );
}

export function Badge({ children, variant = 'default', className }: { children: ReactNode, variant?: 'default' | 'success' | 'warning' | 'error' | 'info', className?: string }) {
  const styles = {
    default: 'bg-gray-100 text-gray-600',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider', styles[variant], className)}>
      {children}
    </span>
  );
}
