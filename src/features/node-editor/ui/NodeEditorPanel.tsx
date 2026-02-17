import { useMemo, useRef, useState } from 'react';
import { isValidXmlName } from '../../../entities/prompt-node/model/validation';
import { useI18n } from '../../../shared/lib/i18n/useI18n';
import { selectActiveDocument, selectSelectedNode, useAppStore } from '../../../shared/model/store';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Panel } from '../../../shared/ui/Panel';

function parseTags(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function NodeEditorPanel() {
  const { t } = useI18n();
  const document = useAppStore(selectActiveDocument);
  const selectedNode = useAppStore(selectSelectedNode);
  const updateNode = useAppStore((state) => state.updateNode);
  const updateActiveDocument = useAppStore((state) => state.updateActiveDocument);
  const settings = useAppStore((state) => state.settings);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [showDocumentMeta, setShowDocumentMeta] = useState(false);
  const [wrapTag, setWrapTag] = useState('tag');

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
    <Panel title={t('nodeEditor')}>
      <div className="editor-collapsible">
        <button
          className="editor-collapse-toggle"
          onClick={() => setShowDocumentMeta((prev) => !prev)}
          type="button"
        >
          {showDocumentMeta ? t('hideDocumentMeta') : t('showDocumentMeta')}
        </button>

        {showDocumentMeta ? (
          <div className="editor-collapsible-content">
            <div className="editor-section">
              <label className="field-label" htmlFor="doc-name">
                {t('documentName')}
              </label>
              <Input
                id="doc-name"
                onChange={(event) =>
                  updateActiveDocument({
                    name: event.target.value,
                  })
                }
                value={document.name}
              />
            </div>

            <div className="editor-section">
              <label className="field-label" htmlFor="doc-tags">
                {t('tags')}
              </label>
              <Input
                id="doc-tags"
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
        ) : null}
      </div>

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
