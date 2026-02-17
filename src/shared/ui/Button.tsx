import clsx from 'clsx';
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: 'default' | 'brand' | 'danger' | 'ghost';
  tooltip?: string;
}

export function Button({
  tone = 'default',
  tooltip,
  title,
  className,
  children,
  ...props
}: PropsWithChildren<ButtonProps>) {
  const resolvedTooltip =
    tooltip ?? (typeof title === 'string' && title.length > 0 ? title : undefined);

  return (
    <button
      className={clsx(
        'omc-btn',
        `omc-btn-${tone}`,
        resolvedTooltip && 'omc-tooltip-btn',
        className,
      )}
      data-tooltip={resolvedTooltip}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
