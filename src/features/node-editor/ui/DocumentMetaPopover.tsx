import { useMemo } from 'react';
import { X } from 'lucide-react';
import { isValidXmlName } from '../../../entities/prompt-node/model/validation';
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

  const hints = useMemo(() => {
    if (language === 'ko') {
      return {
        documentName: 'Vault에서 문서를 식별할 때 쓰는 이름입니다.',
        documentLabels: '검색과 분류용 라벨입니다. 쉼표로 여러 개를 입력할 수 있습니다.',
        rootTag:
          '내보내기 시 전체 노드를 감싸는 최상위 태그입니다. XML 루트 구조가 필요할 때 사용합니다.',
      };
    }

    return {
      documentName: 'Used to identify this document in the vault.',
      documentLabels: 'Labels for search and filtering. Separate multiple values with commas.',
      rootTag:
        'Top-level tag wrapping the exported tree. Useful when a single XML root is required.',
    };
  }, [language]);

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
