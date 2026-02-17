import { useMemo } from 'react';
import type { AppLanguage } from '../../shared/lib/i18n/messages';
import { localize } from '../../shared/lib/i18n/localize';
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

  const hints = useMemo(
    () =>
      localize(language, {
        ko: {
          language:
            '??UI ?몄뼱瑜??꾪솚?⑸땲?? 釉뚮씪?곗? ?몄뼱??泥?諛⑸Ц ?쒕쭔 湲곕낯媛믪쑝濡?諛섏쁺?⑸땲??',
          confirmBeforeDelete: '臾몄꽌 ??젣 ?꾩뿉 ?뺤씤 李쎌쓣 ?쒖떆?⑸땲??',
          markdownPreview:
            '?몃뱶 ?몄쭛湲곗뿉??Markdown 紐⑤뱶????誘몃━蹂닿린瑜??④퍡 蹂댁뿬以띾땲??',
          rawXmlStrictMode: 'RawXML ?좏슚??寃?щ? 媛뺥솕?섎뒗 v1 以鍮??듭뀡?낅땲??',
          defaultRootTagEnabled:
            '??臾몄꽌 ?앹꽦 ??猷⑦듃 ?쒓렇瑜?湲곕낯?쇰줈 ?쒖꽦?뷀빀?덈떎.',
          defaultRootTagName:
            '??臾몄꽌?먯꽌 ?ъ슜??湲곕낯 猷⑦듃 ?쒓렇 ?대쫫?낅땲??',
        },
        en: {
          language:
            'Switch the app UI language. Browser locale is applied only on first visit.',
          confirmBeforeDelete:
            'Show a confirmation dialog before deleting documents.',
          markdownPreview:
            'Show markdown preview in Node Editor when content mode is Markdown.',
          rawXmlStrictMode: 'v1 placeholder option for stricter RawXML validation.',
          defaultRootTagEnabled:
            'Enable root tag by default for newly created documents.',
          defaultRootTagName:
            'Default root tag name used for new documents.',
        },
      }),
    [language],
  );

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
