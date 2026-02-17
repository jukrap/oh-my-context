import type { ReactNode } from 'react';

const INLINE_TOKEN_PATTERN =
  /(!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|\*[^*\n]+\*|_[^_\n]+_)/g;

function parseLinkToken(raw: string): { label: string; url: string } | null {
  const match = raw.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  if (!match) {
    return null;
  }

  const label = match[1] ?? '';
  const url = (match[2] ?? '').trim();
  if (!label || !url) {
    return null;
  }

  return { label, url };
}

function parseImageToken(raw: string): { alt: string; src: string } | null {
  const match = raw.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
  if (!match) {
    return null;
  }

  const alt = match[1] ?? '';
  const src = (match[2] ?? '').trim();
  if (!src) {
    return null;
  }

  return { alt, src };
}

function isHorizontalRuleLine(line: string): boolean {
  return /^(?:-{3,}|\*{3,}|_{3,})$/.test(line.trim());
}

function renderInlineMarkdown(text: string, keyPrefix: string): ReactNode[] {
  const tokens: ReactNode[] = [];
  let cursor = 0;
  let index = 0;

  for (const match of text.matchAll(INLINE_TOKEN_PATTERN)) {
    if (typeof match.index !== 'number') {
      continue;
    }

    const start = match.index;
    const raw = match[0];

    if (start > cursor) {
      tokens.push(text.slice(cursor, start));
    }

    const imageToken = parseImageToken(raw);
    if (imageToken) {
      tokens.push(
        <img
          alt={imageToken.alt}
          className="md-image"
          key={`${keyPrefix}-img-${index}`}
          loading="lazy"
          src={imageToken.src}
        />,
      );
    } else {
      const linkToken = parseLinkToken(raw);
      if (linkToken) {
        tokens.push(
          <a
            className="md-link"
            href={linkToken.url}
            key={`${keyPrefix}-link-${index}`}
            rel="noreferrer noopener"
            target="_blank"
          >
            {renderInlineMarkdown(linkToken.label, `${keyPrefix}-link-label-${index}`)}
          </a>,
        );
      } else if (
        (raw.startsWith('**') && raw.endsWith('**')) ||
        (raw.startsWith('__') && raw.endsWith('__'))
      ) {
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
      } else if (raw.startsWith('~~') && raw.endsWith('~~')) {
        tokens.push(
          <del className="md-strike" key={`${keyPrefix}-strike-${index}`}>
            {raw.slice(2, -2)}
          </del>,
        );
      } else if (
        (raw.startsWith('*') && raw.endsWith('*')) ||
        (raw.startsWith('_') && raw.endsWith('_'))
      ) {
        tokens.push(
          <em key={`${keyPrefix}-em-${index}`}>
            {raw.slice(1, -1)}
          </em>,
        );
      } else {
        tokens.push(raw);
      }
    }

    cursor = start + raw.length;
    index += 1;
  }

  if (cursor < text.length) {
    tokens.push(text.slice(cursor));
  }

  return tokens.length > 0 ? tokens : [text];
}

export function renderMarkdownBlocks(source: string): ReactNode[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let lineIndex = 0;
  let blockIndex = 0;

  const isBlockStart = (line: string): boolean => {
    const trimmed = line.trim();
    return (
      trimmed.startsWith('```') ||
      /^#{1,6}\s+/.test(trimmed) ||
      /^\s*\d+\.\s+/.test(line) ||
      /^\s*[-*]\s+/.test(line) ||
      /^\s*>\s+/.test(line) ||
      isHorizontalRuleLine(line)
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

    if (isHorizontalRuleLine(line)) {
      blocks.push(<hr className="md-hr" key={`md-hr-${blockIndex}`} />);
      blockIndex += 1;
      lineIndex += 1;
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
        <Heading className={`md-heading md-h${level}`} key={`md-heading-${blockIndex}`}>
          {renderInlineMarkdown(content, `heading-${blockIndex}`)}
        </Heading>,
      );
      blockIndex += 1;
      lineIndex += 1;
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const orderedItems: Array<{ order: number; text: string }> = [];

      while (lineIndex < lines.length) {
        const current = lines[lineIndex] ?? '';
        const orderedMatch = current.match(/^\s*(\d+)\.\s+(.+)$/);
        if (!orderedMatch) {
          break;
        }

        orderedItems.push({
          order: Number(orderedMatch[1] ?? '1'),
          text: orderedMatch[2] ?? '',
        });
        lineIndex += 1;
      }

      const start = orderedItems[0]?.order ?? 1;
      blocks.push(
        <ol className="md-list md-list-ordered" key={`md-ol-${blockIndex}`} start={start}>
          {orderedItems.map((item, index) => (
            <li key={`md-ol-item-${blockIndex}-${index}`}>
              {renderInlineMarkdown(item.text, `ol-${blockIndex}-${index}`)}
            </li>
          ))}
        </ol>,
      );
      blockIndex += 1;
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
