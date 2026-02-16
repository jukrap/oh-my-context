import { nanoid } from 'nanoid';
import { arrayMove } from '@dnd-kit/sortable';
import type { PromptNode } from './types';

export function createNode(partial?: Partial<PromptNode>): PromptNode {
  return {
    id: nanoid(),
    tagName: partial?.tagName ?? 'context',
    attributes: partial?.attributes ?? {},
    contentMode: partial?.contentMode ?? 'Plain',
    content: partial?.content ?? '',
    children: partial?.children ?? [],
    enabled: partial?.enabled ?? true,
    collapsed: partial?.collapsed ?? false,
  };
}

export function cloneNodeWithNewIds(node: PromptNode): PromptNode {
  return {
    ...node,
    id: nanoid(),
    children: node.children.map(cloneNodeWithNewIds),
  };
}

export function cloneNodesWithNewIds(nodes: PromptNode[]): PromptNode[] {
  return nodes.map(cloneNodeWithNewIds);
}

export function deepCloneNodes(nodes: PromptNode[]): PromptNode[] {
  return nodes.map((node) => ({
    ...node,
    attributes: { ...node.attributes },
    children: deepCloneNodes(node.children),
  }));
}

export function findNodeById(
  nodes: PromptNode[],
  nodeId: string,
): PromptNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return node;
    }

    const childHit = findNodeById(node.children, nodeId);
    if (childHit) {
      return childHit;
    }
  }

  return null;
}

export function updateNodeInTree(
  nodes: PromptNode[],
  nodeId: string,
  updater: (node: PromptNode) => PromptNode,
): PromptNode[] {
  return nodes.map((node) => {
    if (node.id === nodeId) {
      return updater(node);
    }

    if (node.children.length === 0) {
      return node;
    }

    const nextChildren = updateNodeInTree(node.children, nodeId, updater);
    if (nextChildren === node.children) {
      return node;
    }

    return {
      ...node,
      children: nextChildren,
    };
  });
}

export function removeNodeFromTree(
  nodes: PromptNode[],
  nodeId: string,
): PromptNode[] {
  return nodes
    .filter((node) => node.id !== nodeId)
    .map((node) => ({
      ...node,
      children: removeNodeFromTree(node.children, nodeId),
    }));
}

export function addChildNodeInTree(
  nodes: PromptNode[],
  parentId: string,
  child: PromptNode,
): PromptNode[] {
  return nodes.map((node) => {
    if (node.id === parentId) {
      return {
        ...node,
        collapsed: false,
        children: [...node.children, child],
      };
    }

    if (node.children.length === 0) {
      return node;
    }

    return {
      ...node,
      children: addChildNodeInTree(node.children, parentId, child),
    };
  });
}

export function duplicateNodeInTree(
  nodes: PromptNode[],
  nodeId: string,
): PromptNode[] {
  const duplicateInList = (list: PromptNode[]): PromptNode[] => {
    const hitIndex = list.findIndex((node) => node.id === nodeId);
    if (hitIndex >= 0) {
      const target = list[hitIndex];
      if (!target) {
        return list;
      }

      const duplicate = cloneNodeWithNewIds(target);
      const nextList = [...list];
      nextList.splice(hitIndex + 1, 0, duplicate);
      return nextList;
    }

    return list.map((node) => ({
      ...node,
      children: duplicateInList(node.children),
    }));
  };

  return duplicateInList(nodes);
}

export function flattenVisibleNodeIds(nodes: PromptNode[]): string[] {
  const ids: string[] = [];

  const walk = (nodeList: PromptNode[]): void => {
    nodeList.forEach((node) => {
      ids.push(node.id);
      if (!node.collapsed) {
        walk(node.children);
      }
    });
  };

  walk(nodes);
  return ids;
}

export function buildNodeVisibilitySet(
  nodes: PromptNode[],
  query: string,
): Set<string> {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return new Set(flattenVisibleNodeIds(nodes));
  }

  const visible = new Set<string>();

  const walk = (node: PromptNode): boolean => {
    const ownMatch =
      node.tagName.toLowerCase().includes(normalizedQuery) ||
      node.content.toLowerCase().includes(normalizedQuery);

    let childMatch = false;
    node.children.forEach((child) => {
      if (walk(child)) {
        childMatch = true;
      }
    });

    if (ownMatch || childMatch) {
      visible.add(node.id);
      return true;
    }

    return false;
  };

  nodes.forEach((node) => {
    walk(node);
  });

  return visible;
}

export function pruneDisabledNodes(nodes: PromptNode[]): PromptNode[] {
  return nodes
    .filter((node) => node.enabled)
    .map((node) => ({
      ...node,
      children: pruneDisabledNodes(node.children),
    }));
}

export function reorderNodesWithinParent(
  nodes: PromptNode[],
  activeId: string,
  overId: string,
): PromptNode[] {
  const visit = (list: PromptNode[]): [PromptNode[], boolean] => {
    const activeIndex = list.findIndex((node) => node.id === activeId);
    const overIndex = list.findIndex((node) => node.id === overId);

    if (activeIndex >= 0 && overIndex >= 0) {
      return [arrayMove(list, activeIndex, overIndex), true];
    }

    let moved = false;
    const nextList = list.map((node) => {
      if (moved || node.children.length === 0) {
        return node;
      }

      const [nextChildren, didMove] = visit(node.children);
      if (didMove) {
        moved = true;
        return {
          ...node,
          children: nextChildren,
        };
      }

      return node;
    });

    return [moved ? nextList : list, moved];
  };

  return visit(nodes)[0];
}
