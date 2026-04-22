import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'ghost' | 'subtle' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-b from-brand-500 to-brand-700 text-white hover:from-brand-400 hover:to-brand-600 shadow-[0_10px_30px_-12px_rgba(83,80,255,0.6)]',
  ghost: 'text-neutral-200 hover:bg-white/5',
  subtle: 'glass glass-hover text-neutral-100',
  outline: 'border border-white/10 bg-transparent hover:bg-white/5 text-neutral-100',
  danger: 'bg-gradient-to-b from-red-500 to-red-700 text-white hover:from-red-400 hover:to-red-600'
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] rounded-lg',
  md: 'h-10 px-4 text-sm rounded-xl',
  lg: 'h-12 px-6 text-base rounded-xl'
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...rest }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ring-brand select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    >
      {loading && (
        <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden />
      )}
      {children}
    </button>
  )
);
Button.displayName = 'Button';
