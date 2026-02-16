import clsx from 'clsx';
import type { PropsWithChildren } from 'react';
import { Button } from './Button';

interface DrawerProps {
  title: string;
  open: boolean;
  onClose: () => void;
}

export function Drawer({ title, open, onClose, children }: PropsWithChildren<DrawerProps>) {
  return (
    <div className={clsx('omc-drawer-overlay', open && 'is-open')}>
      <aside aria-hidden={!open} className={clsx('omc-drawer', open && 'is-open')}>
        <header className="omc-drawer-header">
          <h3>{title}</h3>
          <Button tone="ghost" onClick={onClose}>
            Close
          </Button>
        </header>
        <div className="omc-drawer-body">{children}</div>
      </aside>
    </div>
  );
}
