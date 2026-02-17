import { X } from 'lucide-react';
import { useMemo } from 'react';
import { isValidXmlName } from '../../../entities/prompt-node/model/validation';
import { localize } from '../../../shared/lib/i18n/localize';
import { useI18n } from '../../../shared/lib/i18n/useI18n';
import { selectActiveDocument, useAppStore } from '../../../shared/model/store';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';

interface DocumentMetaPopoverProps {
  open: boolean;
  onClose: () => void;
}

function parseTags(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function DocumentMetaPopover({ open, onClose }: DocumentMetaPopoverProps) {
  const { language, t } = useI18n();
  const document = useAppStore(selectActiveDocument);
  const updateActiveDocument = useAppStore((state) => state.updateActiveDocument);

  const hints = useMemo(
    () =>
      localize(language, {
        ko: {
          documentName: 'Vault?먯꽌 臾몄꽌瑜??앸퀎?????곕뒗 ?대쫫?낅땲??',
          documentLabels:
            '寃?됯낵 遺꾨쪟???쇰꺼?낅땲?? ?쇳몴濡??щ윭 媛쒕? ?낅젰?????덉뒿?덈떎.',
          rootTag:
            '?대낫?닿린 ???꾩껜 ?몃뱶瑜?媛먯떥??理쒖긽???쒓렇?낅땲?? XML 猷⑦듃 援ъ“媛 ?꾩슂?????ъ슜?⑸땲??',
        },
        en: {
          documentName: 'Used to identify this document in the vault.',
          documentLabels:
            'Labels for search and filtering. Separate multiple values with commas.',
          rootTag:
            'Top-level tag wrapping the exported tree. Useful when a single XML root is required.',
        },
      }),
    [language],
  );

  if (!open || !document) {
    return null;
  }

  return (
    <section className="docmeta-popover">
      <header className="docmeta-popover-header">
        <strong>{t('documentMeta')}</strong>
        <Button aria-label={t('close')} onClick={onClose} title={t('close')} tone="ghost">
          <X size={14} />
        </Button>
      </header>

      <div className="docmeta-popover-body">
        <div className="editor-section">
          <label
            className="field-label omc-tooltip-hint"
            data-tooltip={hints.documentName}
            htmlFor="popover-doc-name"
          >
            {t('documentName')}
          </label>
          <Input
            id="popover-doc-name"
            onChange={(event) =>
              updateActiveDocument({
                name: event.target.value,
              })
            }
            value={document.name}
          />
        </div>

        <div className="editor-section">
          <label
            className="field-label omc-tooltip-hint"
            data-tooltip={hints.documentLabels}
            htmlFor="popover-doc-tags"
          >
            {t('documentLabels')}
          </label>
          <Input
            id="popover-doc-tags"
            onChange={(event) =>
              updateActiveDocument({
                tags: parseTags(event.target.value),
              })
            }
            placeholder={t('tagsPlaceholder')}
            value={document.tags.join(', ')}
          />
        </div>

        <div className="editor-section inline-grid">
          <label className="field-label omc-tooltip-hint" data-tooltip={hints.rootTag}>
            <input
              checked={document.rootTagEnabled}
              onChange={(event) =>
                updateActiveDocument({
                  rootTagEnabled: event.target.checked,
                })
              }
              type="checkbox"
            />
            {t('rootTag')}
          </label>
          <Input
            invalid={document.rootTagEnabled && !isValidXmlName(document.rootTagName)}
            onChange={(event) =>
              updateActiveDocument({
                rootTagName: event.target.value,
              })
            }
            placeholder="prompt"
            value={document.rootTagName}
          />
        </div>
      </div>
    </section>
  );
}
