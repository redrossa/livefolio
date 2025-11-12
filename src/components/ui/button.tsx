import * as React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

const variantStyles: Record<ButtonVariant, string> = {
  default:
    'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary',
  outline:
    'border border-input bg-background text-foreground hover:bg-muted focus-visible:ring-ring',
  ghost:
    'bg-transparent text-foreground hover:bg-muted focus-visible:ring-ring',
  link: 'bg-transparent text-primary underline-offset-4 hover:underline focus-visible:ring-ring',
};

const sizeStyles: Record<ButtonSize, string> = {
  default: 'h-10 px-4 py-2 text-sm',
  sm: 'h-9 px-3 text-xs',
  lg: 'h-11 px-8 text-base',
  icon: 'h-10 w-10',
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'default', size = 'default', type = 'button', ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';
