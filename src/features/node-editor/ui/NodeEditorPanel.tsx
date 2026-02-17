import { FileCog, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { isValidXmlName } from '../../../entities/prompt-node/model/validation';
import { localize } from '../../../shared/lib/i18n/localize';
import { useI18n } from '../../../shared/lib/i18n/useI18n';
import { renderMarkdownBlocks } from '../../../shared/lib/markdown/preview';
import { selectActiveDocument, selectSelectedNode, useAppStore } from '../../../shared/model/store';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Panel } from '../../../shared/ui/Panel';
import { DocumentMetaPopover } from './DocumentMetaPopover';

export function NodeEditorPanel() {
  const { language, t } = useI18n();
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

  const fieldHints = useMemo(
    () =>
      localize(language, {
        ko: {
          tagName:
            'XML ?쒓렇 ?대쫫?낅땲?? 洹쒖튃??留욎? ?딆쑝硫??대낫?닿린媛 李⑤떒?⑸땲??',
          attributes:
            '?띿꽦 ?ㅻ뒗 XML ?대쫫 洹쒖튃???곕씪???⑸땲?? 媛믪? 臾몄옄?대줈 ??λ맗?덈떎.',
          contentMode:
            'Plain/Markdown/RawXML 以?肄섑뀗痢?泥섎━ 諛⑹떇???좏깮?⑸땲??',
          content:
            '?몃뱶 蹂몃Ц?낅땲?? ?뱀닔臾몄옄???대낫?닿린 ???덉쟾?섍쾶 泥섎━?⑸땲??',
          wrap:
            '肄섑뀗痢좎뿉???좏깮???띿뒪?몃? ?낅젰???쒓렇濡?利됱떆 媛먯뙃?덈떎.',
        },
        en: {
          tagName: 'XML tag name. Invalid names block export.',
          attributes:
            'Attribute keys must follow XML name rules. Values are stored as strings.',
          contentMode:
            'Choose how this node content is handled: Plain, Markdown or RawXML.',
          content:
            'Node body content. Special characters are safely handled during export.',
          wrap:
            'Wrap currently selected text in the content area with the tag you entered.',
        },
      }),
    [language],
  );

  const contentModeMeta = useMemo(
    () =>
      localize(language, {
        ko: {
          Plain: {
            label: 'Plain',
            description:
              '?쇰컲 ?띿뒪??紐⑤뱶?낅땲?? ?대낫?닿린 ??CDATA濡?媛먯떥 ?덉쟾?섍쾶 吏곷젹?붾맗?덈떎.',
          },
          Markdown: {
            label: 'Markdown',
            description:
              '留덊겕?ㅼ슫 臾몃쾿???좎??섎뒗 ?띿뒪??紐⑤뱶?낅땲?? ?ㅼ젙???곕씪 ?섎떒 誘몃━蹂닿린瑜?蹂????덉뒿?덈떎.',
          },
          RawXML: {
            label: 'RawXML',
            description:
              'XML 議곌컖??洹몃?濡??ｋ뒗 紐⑤뱶?낅땲?? ?섎せ??XML?대㈃ 異쒕젰??源⑥쭏 ???덉쑝??二쇱쓽?섏꽭??',
          },
        },
        en: {
          Plain: {
            label: 'Plain',
            description:
              'General text mode. Export wraps content safely with CDATA.',
          },
          Markdown: {
            label: 'Markdown',
            description:
              'Markdown-aware text mode. Optional preview is shown below when enabled.',
          },
          RawXML: {
            label: 'RawXML',
            description:
              'Injects raw XML fragment as-is. Invalid XML may break export output.',
          },
        },
      }),
    [language],
  );

  const markdownPreviewNodes = useMemo(() => {
    if (!selectedNode || selectedNode.contentMode !== 'Markdown') {
      return [];
    }

    return renderMarkdownBlocks(selectedNode.content);
  }, [selectedNode]);

  if (!document) {
    return <Panel title={t('nodeEditor')}>{t('noActiveDocument')}</Panel>;
  }

  return (
    <Panel
      className="node-editor-panel"
      rightSlot={
        <div className="panel-meta-trigger">
          <Button
            aria-expanded={showDocumentMeta}
            onClick={() => setShowDocumentMeta((prev) => !prev)}
            title={showDocumentMeta ? t('hideDocumentMeta') : t('showDocumentMeta')}
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
        <div className="node-editor-sections">
          <div className="editor-section">
            <label
              className="field-label omc-tooltip-btn"
              data-tooltip={fieldHints.tagName}
              htmlFor="node-tag"
            >
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
              <span className="field-label omc-tooltip-btn" data-tooltip={fieldHints.attributes}>
                {t('attributes')}
              </span>
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
                title={t('addAttribute')}
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
                  title={t('removeAttribute')}
                  tone="danger"
                >
                  <Trash2 size={14} />
                  {t('removeAttribute')}
                </Button>
              </div>
            ))}
          </div>

          <div className="editor-section">
            <label
              className="field-label omc-tooltip-btn"
              data-tooltip={fieldHints.contentMode}
              htmlFor="content-mode"
            >
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
              <option value="Plain">{contentModeMeta.Plain.label}</option>
              <option value="Markdown">{contentModeMeta.Markdown.label}</option>
              <option value="RawXML">{contentModeMeta.RawXML.label}</option>
            </select>
            <p className="field-help">
              {contentModeMeta[selectedNode.contentMode].description}
            </p>
          </div>

          <div className="editor-section">
            <div className="editor-row">
              <label
                className="field-label omc-tooltip-btn"
                data-tooltip={fieldHints.content}
                htmlFor="node-content"
              >
                {t('content')}
              </label>
              <span
                className="token-estimate omc-tooltip-btn"
                data-tooltip={t('tokenEstimate', { count: contentLengthEstimate })}
              >
                <span className="token-estimate-count">~{contentLengthEstimate.toLocaleString()}</span>
                <span className="token-estimate-unit">tok est.</span>
                <span className="sr-only">
                  {t('tokenEstimate', { count: contentLengthEstimate })}
                </span>
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
            <div className="inline-grid wrap-selection-row">
              <Input
                aria-label={t('tagName')}
                onChange={(event) => setWrapTag(event.target.value)}
                value={wrapTag}
              />
              <Button
                className="wrap-selection-btn"
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
                title={fieldHints.wrap}
                tone="default"
              >
                <Sparkles size={14} />
                {t('wrapSelection')}
              </Button>
            </div>
          </div>

          {selectedNode.contentMode === 'Markdown' && settings.showMarkdownPreview ? (
            <div className="editor-section">
              <p className="field-label">{t('markdownPreview')}</p>
              <div className="markdown-preview markdown-preview-rendered">
                {markdownPreviewNodes.length > 0 ? markdownPreviewNodes : null}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </Panel>
  );
}
