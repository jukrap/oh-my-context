import { X } from 'lucide-react';
import { isValidXmlName } from '../../entities/prompt-node/model/validation';
import { useI18n } from '../../shared/lib/i18n/useI18n';
import { selectActiveDocument, useAppStore } from '../../shared/model/store';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';

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
  const { t } = useI18n();
  const document = useAppStore(selectActiveDocument);
  const updateActiveDocument = useAppStore((state) => state.updateActiveDocument);

  if (!open || !document) {
    return null;
  }

  return (
    <section className="docmeta-popover">
      <header className="docmeta-popover-header">
        <strong>{t('documentMeta')}</strong>
        <Button onClick={onClose} tone="ghost">
          <X size={14} />
        </Button>
      </header>

      <div className="docmeta-popover-body">
        <div className="editor-section">
          <label className="field-label" htmlFor="popover-doc-name">
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
          <label className="field-label" htmlFor="popover-doc-tags">
            {t('tags')}
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
          <label className="field-label">
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
