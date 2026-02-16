import { useMemo, useRef, useState } from 'react';
import { isValidXmlName } from '../../../entities/prompt-node/model/validation';
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
  const document = useAppStore(selectActiveDocument);
  const selectedNode = useAppStore(selectSelectedNode);
  const updateNode = useAppStore((state) => state.updateNode);
  const updateActiveDocument = useAppStore((state) => state.updateActiveDocument);
  const settings = useAppStore((state) => state.settings);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [wrapTag, setWrapTag] = useState('tag');

  const contentLengthEstimate = useMemo(() => {
    if (!selectedNode) {
      return 0;
    }

    return Math.ceil(selectedNode.content.length / 4);
  }, [selectedNode]);

  if (!document) {
    return <Panel title="Editor">No active document.</Panel>;
  }

  return (
    <Panel title="Node Editor">
      <div className="editor-section">
        <label className="field-label" htmlFor="doc-name">
          Document Name
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
          Tags
        </label>
        <Input
          id="doc-tags"
          onChange={(event) =>
            updateActiveDocument({
              tags: parseTags(event.target.value),
            })
          }
          placeholder="prompt, policy, baseline"
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
          Root Tag
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

      {!selectedNode ? (
        <p className="empty-hint">Select a node from the stack to edit details.</p>
      ) : (
        <>
          <hr className="divider" />

          <div className="editor-section">
            <label className="field-label" htmlFor="node-tag">
              Tag Name
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
              <p className="field-error">Tag must match XML name pattern.</p>
            ) : null}
          </div>

          <div className="editor-section">
            <div className="editor-row">
              <span className="field-label">Attributes</span>
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
                Add Attr
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
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <div className="editor-section">
            <label className="field-label" htmlFor="content-mode">
              Content Mode
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
                Content
              </label>
              <span className="token-estimate">
                ~{contentLengthEstimate} tokens (rough chars/4 estimate)
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
              Wrap Selection with Tag
            </Button>
          </div>

          {selectedNode.contentMode === 'Markdown' && settings.showMarkdownPreview ? (
            <div className="editor-section">
              <p className="field-label">Markdown Preview (raw)</p>
              <pre className="markdown-preview">{selectedNode.content}</pre>
            </div>
          ) : null}
        </>
      )}
    </Panel>
  );
}
