import type { AppLanguage } from '../../shared/lib/i18n/messages';
import { useMemo } from 'react';
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

  const hints = useMemo(() => {
    if (language === 'ko') {
      return {
        language: '앱 UI 언어를 전환합니다. 브라우저 언어는 첫 방문 시만 기본값으로 반영됩니다.',
        confirmBeforeDelete: '문서 삭제 전에 확인 창을 표시합니다.',
        markdownPreview: '노드 편집기에서 Markdown 모드일 때 미리보기를 함께 보여줍니다.',
        rawXmlStrictMode: 'RawXML 유효성 검사를 강화하는 v1 준비 옵션입니다.',
        defaultRootTagEnabled: '새 문서 생성 시 루트 태그를 기본으로 활성화합니다.',
        defaultRootTagName: '새 문서에서 사용할 기본 루트 태그 이름입니다.',
      };
    }

    return {
      language: 'Switch the app UI language. Browser locale is applied only on first visit.',
      confirmBeforeDelete: 'Show a confirmation dialog before deleting documents.',
      markdownPreview: 'Show markdown preview in Node Editor when content mode is Markdown.',
      rawXmlStrictMode: 'v1 placeholder option for stricter RawXML validation.',
      defaultRootTagEnabled: 'Enable root tag by default for newly created documents.',
      defaultRootTagName: 'Default root tag name used for new documents.',
    };
  }, [language]);

  return (
    <Drawer onClose={onClose} open={open} title={t('settings')}>
      <div className="drawer-group">
        <h4 className="omc-tooltip-hint" data-tooltip={hints.language}>
          {t('language')}
        </h4>
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
        <label className="setting-label omc-tooltip-hint" data-tooltip={hints.confirmBeforeDelete}>
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
        <label className="setting-label omc-tooltip-hint" data-tooltip={hints.markdownPreview}>
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
        <label className="setting-label omc-tooltip-hint" data-tooltip={hints.rawXmlStrictMode}>
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
        <label className="setting-label omc-tooltip-hint" data-tooltip={hints.defaultRootTagEnabled}>
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
        <div className="setting-field">
          <label
            className="setting-label omc-tooltip-hint"
            data-tooltip={hints.defaultRootTagName}
            htmlFor="default-root-tag-name-input"
          >
            {t('defaultRootTagName')}
          </label>
          <Input
            id="default-root-tag-name-input"
            onChange={(event) =>
              updateSettings({ defaultRootTagName: event.target.value })
            }
            value={settings.defaultRootTagName}
          />
        </div>
      </div>
    </Drawer>
  );
}
