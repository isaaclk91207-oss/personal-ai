import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-bg-input border border-border-primary rounded-xl
            text-text-primary placeholder-text-muted
            transition-all duration-200 ease-out
            focus:outline-none focus:border-primary focus:shadow-glow-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 text-sm
            ${error ? 'border-error focus:border-error focus:shadow-[0_0_20px_rgba(239,68,68,0.15)]' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={`
          w-full bg-bg-input border border-border-primary rounded-xl
          text-text-primary placeholder-text-muted
          transition-all duration-200 ease-out
          focus:outline-none focus:border-primary focus:shadow-glow-primary
          disabled:opacity-50 disabled:cursor-not-allowed
          px-4 py-2.5 text-sm resize-none
          ${error ? 'border-error' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  )
);
Textarea.displayName = 'Textarea';
