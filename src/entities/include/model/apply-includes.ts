import type { PromptNode } from '../../prompt-node/model/types';
import { deepCloneNodes } from '../../prompt-node/model/tree';
import type { GlobalInclude } from './types';

interface IncludeCollection {
  [id: string]: GlobalInclude;
}

function insertRelativeToTag(
  nodes: PromptNode[],
  includeNodes: PromptNode[],
  targetTagName: string,
  position: 'BEFORE_TAG' | 'AFTER_TAG' | 'INSIDE_TAG',
): PromptNode[] {
  const next: PromptNode[] = [];

  nodes.forEach((node) => {
    if (node.tagName === targetTagName && position === 'BEFORE_TAG') {
      next.push(...deepCloneNodes(includeNodes));
    }

    if (node.tagName === targetTagName && position === 'INSIDE_TAG') {
      next.push({
        ...node,
        children: [...deepCloneNodes(includeNodes), ...node.children],
      });
      return;
    }

    next.push({
      ...node,
      children: insertRelativeToTag(
        node.children,
        includeNodes,
        targetTagName,
        position,
      ),
    });

    if (node.tagName === targetTagName && position === 'AFTER_TAG') {
      next.push(...deepCloneNodes(includeNodes));
    }
  });

  return next;
}

function applySingleInclude(
  nodes: PromptNode[],
  includeItem: GlobalInclude,
): PromptNode[] {
  const includeNodes = deepCloneNodes(includeItem.nodes);

  switch (includeItem.insertion.position) {
    case 'TOP':
      return [...includeNodes, ...nodes];
    case 'BOTTOM':
      return [...nodes, ...includeNodes];
    case 'BEFORE_TAG':
    case 'AFTER_TAG':
    case 'INSIDE_TAG':
      return insertRelativeToTag(
        nodes,
        includeNodes,
        includeItem.insertion.targetTagName,
        includeItem.insertion.position,
      );
    default:
      return nodes;
  }
}

export function applyIncludes(
  nodes: PromptNode[],
  includeIds: string[],
  includesById: IncludeCollection,
): PromptNode[] {
  return includeIds.reduce<PromptNode[]>((acc, includeId) => {
    const includeItem = includesById[includeId];
    if (!includeItem) {
      return acc;
    }

    return applySingleInclude(acc, includeItem);
  }, deepCloneNodes(nodes));
}
