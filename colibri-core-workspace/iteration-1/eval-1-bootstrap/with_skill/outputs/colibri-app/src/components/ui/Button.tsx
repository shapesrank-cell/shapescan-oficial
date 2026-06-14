import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'success';
}

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  const base = 'min-h-touch min-w-touch rounded-2xl font-medium transition-colors px-6 py-3';
  const variants = {
    primary: 'bg-colibri-primary text-white hover:bg-colibri-primary-light',
    ghost: 'bg-transparent text-colibri-text-secondary hover:text-colibri-text hover:bg-colibri-subtle',
    success: 'bg-colibri-success text-colibri-bg hover:bg-colibri-success/80',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
