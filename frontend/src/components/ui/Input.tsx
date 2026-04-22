import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, icon, id, ...rest }, ref) => {
    const inputId = id || rest.name || Math.random().toString(36).slice(2);
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-[12px] font-medium tracking-wide text-neutral-400">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">{icon}</span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full h-11 rounded-xl bg-white/[0.03] border border-white/[0.07] px-3 text-sm text-neutral-100 placeholder:text-neutral-500',
              'focus:outline-none focus:border-brand-500/60 focus:bg-white/[0.05] transition',
              'ring-brand',
              icon && 'pl-10',
              error && 'border-red-500/60 focus:border-red-500',
              className
            )}
            {...rest}
          />
        </div>
        {(hint || error) && (
          <p className={cn('text-[11px]', error ? 'text-red-400' : 'text-neutral-500')}>{error || hint}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
