import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: LucideIcon;
}

export const inputBaseClass = cn(
  'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm',
  'placeholder:text-slate-400 transition',
  'focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10',
  'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
  'aria-[invalid=true]:border-red-400 aria-[invalid=true]:focus:ring-red-500/10',
);

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, icon: Icon, className, id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          className={cn(inputBaseClass, Icon && 'pl-9', error && 'border-red-400', className)}
          {...rest}
        />
      </div>
      {error ? (
        <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
});
