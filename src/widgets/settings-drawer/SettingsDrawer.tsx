import type { AppLanguage } from '../../shared/lib/i18n/messages';
import { useI18n } from '../../shared/lib/i18n/useI18n';
import { useAppStore } from '../../shared/model/store';
import { Button } from '../../shared/ui/Button';
import { Drawer } from '../../shared/ui/Drawer';
import { Input } from '../../shared/ui/Input';

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
  const { language, t } = useI18n();
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);

  const setLanguage = (next: AppLanguage): void => {
    updateSettings({ language: next });
  };

  return (
    <Drawer onClose={onClose} open={open} title={t('settings')}>
      <div className="drawer-group">
        <h4>{t('language')}</h4>
        <div className="language-toggle-row">
          <Button
            onClick={() => setLanguage('ko')}
            tone={language === 'ko' ? 'brand' : 'default'}
          >
            {t('korean')}
          </Button>
          <Button
            onClick={() => setLanguage('en')}
            tone={language === 'en' ? 'brand' : 'default'}
          >
            {t('english')}
          </Button>
        </div>
        <p className="drawer-hint">{t('languageHint')}</p>
      </div>

      <div className="drawer-group">
        <label>
          <input
            checked={settings.confirmBeforeDelete}
            onChange={(event) =>
              updateSettings({ confirmBeforeDelete: event.target.checked })
            }
            type="checkbox"
          />
          {t('confirmBeforeDelete')}
        </label>
      </div>

      <div className="drawer-group">
        <label>
          <input
            checked={settings.showMarkdownPreview}
            onChange={(event) =>
              updateSettings({ showMarkdownPreview: event.target.checked })
            }
            type="checkbox"
          />
          {t('showMarkdownPreview')}
        </label>
      </div>

      <div className="drawer-group">
        <label>
          <input
            checked={settings.rawXmlStrictMode}
            onChange={(event) =>
              updateSettings({ rawXmlStrictMode: event.target.checked })
            }
            type="checkbox"
          />
          {t('rawXmlStrictMode')}
        </label>
      </div>

      <div className="drawer-group">
        <label>
          <input
            checked={settings.defaultRootTagEnabled}
            onChange={(event) =>
              updateSettings({ defaultRootTagEnabled: event.target.checked })
            }
            type="checkbox"
          />
          {t('defaultRootTagEnabled')}
        </label>
      </div>

      <div className="drawer-group">
        <label>
          {t('defaultRootTagName')}
          <Input
            onChange={(event) =>
              updateSettings({ defaultRootTagName: event.target.value })
            }
            value={settings.defaultRootTagName}
          />
        </label>
      </div>
    </Drawer>
  );
}
