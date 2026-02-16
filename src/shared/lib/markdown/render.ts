import type { GlobalInclude } from '../../../entities/include/model/types';
import { applyIncludes } from '../../../entities/include/model/apply-includes';
import type { PromptDocument } from '../../../entities/prompt-document/model/types';
import { pruneDisabledNodes } from '../../../entities/prompt-node/model/tree';
import type { PromptNode } from '../../../entities/prompt-node/model/types';

function renderNode(node: PromptNode, depth: number): string[] {
  const lines: string[] = [];
  const headingLevel = depth + 2;

  if (headingLevel <= 6) {
    lines.push(`${'#'.repeat(headingLevel)} ${node.tagName}`);
  } else {
    const nestedPadding = '  '.repeat(headingLevel - 7);
    lines.push(`${nestedPadding}- ${node.tagName}`);
  }

  const enabledChildren = node.children.filter((child) => child.enabled);
  if (enabledChildren.length > 0) {
    enabledChildren.forEach((child) => {
      lines.push(...renderNode(child, depth + 1));
    });
  } else if (node.content.trim()) {
    lines.push(node.content.trim());
  }

  lines.push('');
  return lines;
}

export function toMarkdownView(
  document: PromptDocument,
  includesById: Record<string, GlobalInclude>,
): string {
  const withIncludes = applyIncludes(
    document.nodes,
    document.globalIncludeIds,
    includesById,
  );
  const enabledNodes = pruneDisabledNodes(withIncludes);

  const lines = enabledNodes.flatMap((node) => renderNode(node, 0));
  return `${lines.join('\n').trimEnd()}\n`;
}
