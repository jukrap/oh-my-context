import { FileCog, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { isValidXmlName } from '../../../entities/prompt-node/model/validation';
import { useI18n } from '../../../shared/lib/i18n/useI18n';
import { selectActiveDocument, selectSelectedNode, useAppStore } from '../../../shared/model/store';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Panel } from '../../../shared/ui/Panel';
import { DocumentMetaPopover } from './DocumentMetaPopover';

export function NodeEditorPanel() {
  const { t } = useI18n();
  const document = useAppStore(selectActiveDocument);
  const selectedNode = useAppStore(selectSelectedNode);
  const updateNode = useAppStore((state) => state.updateNode);
  const settings = useAppStore((state) => state.settings);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [wrapTag, setWrapTag] = useState('tag');
  const [showDocumentMeta, setShowDocumentMeta] = useState(false);

  const contentLengthEstimate = useMemo(() => {
    if (!selectedNode) {
      return 0;
    }

    return Math.ceil(selectedNode.content.length / 4);
  }, [selectedNode]);

  if (!document) {
    return <Panel title={t('nodeEditor')}>{t('noActiveDocument')}</Panel>;
  }

  return (
    <Panel
      rightSlot={
        <div className="panel-meta-trigger">
          <Button
            aria-expanded={showDocumentMeta}
            onClick={() => setShowDocumentMeta((prev) => !prev)}
            tone={showDocumentMeta ? 'brand' : 'default'}
          >
            <FileCog size={14} />
            {t('documentMeta')}
          </Button>
          <DocumentMetaPopover
            open={showDocumentMeta}
            onClose={() => setShowDocumentMeta(false)}
          />
        </div>
      }
      title={t('nodeEditor')}
    >
      {!selectedNode ? (
        <p className="empty-hint">{t('selectNodeHint')}</p>
      ) : (
        <>
          <hr className="divider" />

          <div className="editor-section">
            <label className="field-label" htmlFor="node-tag">
              {t('tagName')}
            </label>
            <Input
              id="node-tag"
              invalid={!isValidXmlName(selectedNode.tagName)}
              onChange={(event) =>
                updateNode(selectedNode.id, (node) => ({
                  ...node,
                  tagName: event.target.value,
                }))
              }
              value={selectedNode.tagName}
            />
            {!isValidXmlName(selectedNode.tagName) ? (
              <p className="field-error">{t('xmlNameValidation')}</p>
            ) : null}
          </div>

          <div className="editor-section">
            <div className="editor-row">
              <span className="field-label">{t('attributes')}</span>
              <Button
                onClick={() =>
                  updateNode(selectedNode.id, (node) => ({
                    ...node,
                    attributes: {
                      ...node.attributes,
                      [`key_${Object.keys(node.attributes).length + 1}`]: '',
                    },
                  }))
                }
                tone="ghost"
              >
                <Plus size={14} />
                {t('addAttribute')}
              </Button>
            </div>

            {Object.entries(selectedNode.attributes).map(([key, value]) => (
              <div className="attr-row" key={key}>
                <Input
                  invalid={!isValidXmlName(key)}
                  onChange={(event) =>
                    updateNode(selectedNode.id, (node) => {
                      const next: Record<string, string> = {};
                      Object.entries(node.attributes).forEach(([entryKey, entryValue]) => {
                        if (entryKey === key) {
                          next[event.target.value] = entryValue;
                        } else {
                          next[entryKey] = entryValue;
                        }
                      });
                      return {
                        ...node,
                        attributes: next,
                      };
                    })
                  }
                  value={key}
                />
                <Input
                  onChange={(event) =>
                    updateNode(selectedNode.id, (node) => ({
                      ...node,
                      attributes: {
                        ...node.attributes,
                        [key]: event.target.value,
                      },
                    }))
                  }
                  value={value}
                />
                <Button
                  onClick={() =>
                    updateNode(selectedNode.id, (node) => {
                      const next = { ...node.attributes };
                      delete next[key];
                      return {
                        ...node,
                        attributes: next,
                      };
                    })
                  }
                  tone="danger"
                >
                  <Trash2 size={14} />
                  {t('removeAttribute')}
                </Button>
              </div>
            ))}
          </div>

          <div className="editor-section">
            <label className="field-label" htmlFor="content-mode">
              {t('contentMode')}
            </label>
            <select
              className="omc-select"
              id="content-mode"
              onChange={(event) =>
                updateNode(selectedNode.id, (node) => ({
                  ...node,
                  contentMode: event.target.value as typeof node.contentMode,
                }))
              }
              value={selectedNode.contentMode}
            >
              <option value="Plain">Plain</option>
              <option value="Markdown">Markdown</option>
              <option value="RawXML">RawXML</option>
            </select>
          </div>

          <div className="editor-section">
            <div className="editor-row">
              <label className="field-label" htmlFor="node-content">
                {t('content')}
              </label>
              <span className="token-estimate">
                {t('tokenEstimate', { count: contentLengthEstimate })}
              </span>
            </div>
            <textarea
              className="omc-textarea"
              id="node-content"
              onChange={(event) =>
                updateNode(selectedNode.id, (node) => ({
                  ...node,
                  content: event.target.value,
                }))
              }
              ref={textareaRef}
              rows={8}
              value={selectedNode.content}
            />
          </div>

          <div className="editor-section inline-grid">
            <Input onChange={(event) => setWrapTag(event.target.value)} value={wrapTag} />
            <Button
              onClick={() => {
                const element = textareaRef.current;
                if (!element) {
                  return;
                }

                const start = element.selectionStart;
                const end = element.selectionEnd;
                const value = selectedNode.content;
                const selected = value.slice(start, end);
                const wrapped = `<${wrapTag}>${selected}</${wrapTag}>`;
                const nextValue = `${value.slice(0, start)}${wrapped}${value.slice(end)}`;

                updateNode(selectedNode.id, (node) => ({
                  ...node,
                  content: nextValue,
                }));
              }}
              tone="brand"
            >
              <Sparkles size={14} />
              {t('wrapSelection')}
            </Button>
          </div>

          {selectedNode.contentMode === 'Markdown' && settings.showMarkdownPreview ? (
            <div className="editor-section">
              <p className="field-label">{t('markdownPreview')}</p>
              <pre className="markdown-preview">{selectedNode.content}</pre>
            </div>
          ) : null}
        </>
      )}
    </Panel>
  );
}
