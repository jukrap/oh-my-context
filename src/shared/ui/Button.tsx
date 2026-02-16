import clsx from 'clsx';
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: 'default' | 'brand' | 'danger' | 'ghost';
}

export function Button({
  tone = 'default',
  className,
  children,
  ...props
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={clsx('omc-btn', `omc-btn-${tone}`, className)}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
