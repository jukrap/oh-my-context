import { Drawer } from '../../shared/ui/Drawer';
import { useI18n } from '../../shared/lib/i18n/useI18n';

interface TemplatesDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function TemplatesDrawer({ open, onClose }: TemplatesDrawerProps) {
  const { t } = useI18n();

  return (
    <Drawer onClose={onClose} open={open} title={t('templatesV1')}>
      <div className="drawer-group">
        <p>{t('templatesHint')}</p>
      </div>
    </Drawer>
  );
}
