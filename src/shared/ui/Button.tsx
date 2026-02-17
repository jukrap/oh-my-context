import clsx from 'clsx';
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: 'default' | 'brand' | 'danger' | 'ghost';
  tooltip?: string;
  tooltipSide?: 'top' | 'bottom';
}

export function Button({
  tone = 'default',
  tooltip,
  tooltipSide,
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
      data-tooltip-side={resolvedTooltip ? tooltipSide : undefined}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
