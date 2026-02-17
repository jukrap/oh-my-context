import clsx from 'clsx';
import type { PropsWithChildren } from 'react';
import { Button } from './Button';
import { useI18n } from '../lib/i18n/useI18n';

interface DrawerProps {
  title: string;
  open: boolean;
  onClose: () => void;
}

export function Drawer({ title, open, onClose, children }: PropsWithChildren<DrawerProps>) {
  const { t } = useI18n();

  return (
    <div className={clsx('omc-drawer-overlay', open && 'is-open')}>
      <aside aria-hidden={!open} className={clsx('omc-drawer', open && 'is-open')}>
        <header className="omc-drawer-header">
          <h3>{title}</h3>
          <Button tone="ghost" onClick={onClose}>
            {t('close')}
          </Button>
        </header>
        <div className="omc-drawer-body">{children}</div>
      </aside>
    </div>
  );
}
