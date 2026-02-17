import { FileCog, Plus, Sparkles, Trash2 } from 'lucide-react';
import { type ReactNode, useMemo, useRef, useState } from 'react';
import { isValidXmlName } from '../../../entities/prompt-node/model/validation';
import { useI18n } from '../../../shared/lib/i18n/useI18n';
import { selectActiveDocument, selectSelectedNode, useAppStore } from '../../../shared/model/store';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Panel } from '../../../shared/ui/Panel';
import { DocumentMetaPopover } from './DocumentMetaPopover';

function renderInlineMarkdown(text: string, keyPrefix: string): ReactNode[] {
  const tokenPattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\n]+\*)/g;
  const tokens: ReactNode[] = [];
  let cursor = 0;
  let index = 0;

  for (const match of text.matchAll(tokenPattern)) {
    if (typeof match.index !== 'number') {
      continue;
    }

    const start = match.index;
    const raw = match[0];

    if (start > cursor) {
      tokens.push(text.slice(cursor, start));
    }

    if (raw.startsWith('**') && raw.endsWith('**')) {
      tokens.push(
        <strong key={`${keyPrefix}-strong-${index}`}>
          {raw.slice(2, -2)}
        </strong>,
      );
    } else if (raw.startsWith('`') && raw.endsWith('`')) {
      tokens.push(
        <code className="md-inline-code" key={`${keyPrefix}-code-${index}`}>
          {raw.slice(1, -1)}
        </code>,
      );
    } else if (raw.startsWith('*') && raw.endsWith('*')) {
      tokens.push(
        <em key={`${keyPrefix}-em-${index}`}>
          {raw.slice(1, -1)}
        </em>,
      );
    } else {
      tokens.push(raw);
    }

    cursor = start + raw.length;
    index += 1;
  }

  if (cursor < text.length) {
    tokens.push(text.slice(cursor));
  }

  return tokens.length > 0 ? tokens : [text];
}

function renderMarkdownBlocks(source: string): ReactNode[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let lineIndex = 0;
  let blockIndex = 0;

  const isBlockStart = (line: string): boolean => {
    const trimmed = line.trim();
    return (
      trimmed.startsWith('```') ||
      /^#{1,6}\s+/.test(trimmed) ||
      /^\s*[-*]\s+/.test(line) ||
      /^\s*>\s+/.test(line)
    );
  };

  while (lineIndex < lines.length) {
    const line = lines[lineIndex] ?? '';

    if (line.trim() === '') {
      lineIndex += 1;
      continue;
    }

    if (line.trim().startsWith('```')) {
      const codeLines: string[] = [];
      lineIndex += 1;
      while (lineIndex < lines.length && !(lines[lineIndex] ?? '').trim().startsWith('```')) {
        codeLines.push(lines[lineIndex] ?? '');
        lineIndex += 1;
      }
      if (lineIndex < lines.length) {
        lineIndex += 1;
      }

      blocks.push(
        <pre className="md-code-block" key={`md-code-${blockIndex}`}>
          <code>{codeLines.join('\n')}</code>
        </pre>,
      );
      blockIndex += 1;
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const hashes = headingMatch[1];
      const content = headingMatch[2] ?? '';
      const level = hashes ? hashes.length : 1;
      const headingTag =
        level === 1 ? 'h1' : level === 2 ? 'h2' : level === 3 ? 'h3' : level === 4 ? 'h4' : level === 5 ? 'h5' : 'h6';
      const Heading = headingTag;

      blocks.push(
        <Heading className="md-heading" key={`md-heading-${blockIndex}`}>
          {renderInlineMarkdown(content, `heading-${blockIndex}`)}
        </Heading>,
      );
      blockIndex += 1;
      lineIndex += 1;
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (lineIndex < lines.length && /^\s*[-*]\s+/.test(lines[lineIndex] ?? '')) {
        items.push((lines[lineIndex] ?? '').replace(/^\s*[-*]\s+/, ''));
        lineIndex += 1;
      }

      blocks.push(
        <ul className="md-list" key={`md-list-${blockIndex}`}>
          {items.map((item, index) => (
            <li key={`md-list-item-${blockIndex}-${index}`}>
              {renderInlineMarkdown(item, `list-${blockIndex}-${index}`)}
            </li>
          ))}
        </ul>,
      );
      blockIndex += 1;
      continue;
    }

    if (/^\s*>\s+/.test(line)) {
      const quoteLines: string[] = [];
      while (lineIndex < lines.length && /^\s*>\s+/.test(lines[lineIndex] ?? '')) {
        quoteLines.push((lines[lineIndex] ?? '').replace(/^\s*>\s+/, ''));
        lineIndex += 1;
      }

      blocks.push(
        <blockquote className="md-blockquote" key={`md-quote-${blockIndex}`}>
          {renderInlineMarkdown(quoteLines.join(' '), `quote-${blockIndex}`)}
        </blockquote>,
      );
      blockIndex += 1;
      continue;
    }

    const paragraphLines: string[] = [line];
    lineIndex += 1;
    while (lineIndex < lines.length) {
      const next = lines[lineIndex] ?? '';
      if (next.trim() === '' || isBlockStart(next)) {
        break;
      }
      paragraphLines.push(next);
      lineIndex += 1;
    }

    blocks.push(
      <p className="md-paragraph" key={`md-paragraph-${blockIndex}`}>
        {renderInlineMarkdown(paragraphLines.join(' '), `paragraph-${blockIndex}`)}
      </p>,
    );
    blockIndex += 1;
  }

  return blocks;
}

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

  const fieldHints = useMemo(() => {
    if (language === 'ko') {
      return {
        tagName: 'XML 태그 이름입니다. 규칙에 맞지 않으면 내보내기가 차단됩니다.',
        attributes: '속성 키는 XML 이름 규칙을 따라야 합니다. 값은 문자열로 저장됩니다.',
        contentMode: 'Plain/Markdown/RawXML 중 콘텐츠 처리 방식을 선택합니다.',
        content: '노드 본문입니다. 특수문자는 내보내기 시 안전하게 처리됩니다.',
        wrap: '콘텐츠에서 선택한 텍스트를 입력한 태그로 즉시 감쌉니다.',
      };
    }

    return {
      tagName: 'XML tag name. Invalid names block export.',
      attributes: 'Attribute keys must follow XML name rules. Values are stored as strings.',
      contentMode: 'Choose how this node content is handled: Plain, Markdown or RawXML.',
      content: 'Node body content. Special characters are safely handled during export.',
      wrap: 'Wrap currently selected text in the content area with the tag you entered.',
    };
  }, [language]);

  const contentModeMeta = useMemo(() => {
    if (language === 'ko') {
      return {
        Plain: {
          label: 'Plain',
          description:
            '일반 텍스트 모드입니다. 내보내기 시 CDATA로 감싸 안전하게 직렬화됩니다.',
        },
        Markdown: {
          label: 'Markdown',
          description:
            '마크다운 문법을 유지하는 텍스트 모드입니다. 설정에 따라 하단 미리보기를 볼 수 있습니다.',
        },
        RawXML: {
          label: 'RawXML',
          description:
            'XML 조각을 그대로 넣는 모드입니다. 잘못된 XML이면 출력이 깨질 수 있으니 주의하세요.',
        },
      } as const;
    }

    return {
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
    } as const;
  }, [language]);

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
