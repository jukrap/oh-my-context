import clsx from 'clsx';
import type { PropsWithChildren, ReactNode } from 'react';

interface PanelProps {
  title: string;
  className?: string;
  rightSlot?: ReactNode;
}

export function Panel({
  title,
  className,
  rightSlot,
  children,
}: PropsWithChildren<PanelProps>) {
  return (
    <section className={clsx('omc-panel', className)}>
      <header className="omc-panel-header">
        <h2>{title}</h2>
        {rightSlot ? <div className="omc-panel-header-right">{rightSlot}</div> : null}
      </header>
      <div className="omc-panel-body">{children}</div>
    </section>
  );
}
