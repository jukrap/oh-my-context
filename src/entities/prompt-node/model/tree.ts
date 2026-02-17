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

type DropPosition = 'before' | 'inside' | 'after';

function containsNodeId(nodes: PromptNode[], nodeId: string): boolean {
  return nodes.some(
    (node) => node.id === nodeId || containsNodeId(node.children, nodeId),
  );
}

function isDescendantNode(
  nodes: PromptNode[],
  ancestorId: string,
  descendantId: string,
): boolean {
  const ancestor = findNodeById(nodes, ancestorId);
  if (!ancestor) {
    return false;
  }

  return containsNodeId(ancestor.children, descendantId);
}

function detachNode(
  nodes: PromptNode[],
  activeId: string,
): [PromptNode[], PromptNode | null] {
  let extracted: PromptNode | null = null;

  const walk = (list: PromptNode[]): PromptNode[] => {
    const next: PromptNode[] = [];

    list.forEach((node) => {
      if (node.id === activeId) {
        extracted = node;
        return;
      }

      if (node.children.length === 0) {
        next.push(node);
        return;
      }

      const nextChildren = walk(node.children);
      next.push(
        nextChildren === node.children
          ? node
          : {
              ...node,
              children: nextChildren,
            },
      );
    });

    return next;
  };

  const detached = walk(nodes);
  return [detached, extracted];
}

function insertNodeByTarget(
  nodes: PromptNode[],
  targetId: string,
  nodeToInsert: PromptNode,
  position: DropPosition,
): [PromptNode[], boolean] {
  const next: PromptNode[] = [];
  let inserted = false;

  nodes.forEach((node) => {
    if (inserted) {
      next.push(node);
      return;
    }

    if (node.id === targetId) {
      if (position === 'before') {
        next.push(nodeToInsert, node);
      } else if (position === 'after') {
        next.push(node, nodeToInsert);
      } else {
        next.push({
          ...node,
          collapsed: false,
          children: [...node.children, nodeToInsert],
        });
      }

      inserted = true;
      return;
    }

    if (node.children.length === 0) {
      next.push(node);
      return;
    }

    const [nextChildren, childInserted] = insertNodeByTarget(
      node.children,
      targetId,
      nodeToInsert,
      position,
    );
    if (childInserted) {
      inserted = true;
      next.push({
        ...node,
        children: nextChildren,
      });
    } else {
      next.push(node);
    }
  });

  return [inserted ? next : nodes, inserted];
}

export function moveNodeByDrop(
  nodes: PromptNode[],
  activeId: string,
  targetId: string,
  position: DropPosition,
): PromptNode[] {
  if (activeId === targetId) {
    return nodes;
  }

  if (isDescendantNode(nodes, activeId, targetId)) {
    return nodes;
  }

  const [detachedNodes, extractedNode] = detachNode(nodes, activeId);
  if (!extractedNode) {
    return nodes;
  }

  const [insertedNodes, inserted] = insertNodeByTarget(
    detachedNodes,
    targetId,
    extractedNode,
    position,
  );

  return inserted ? insertedNodes : [...detachedNodes, extractedNode];
}

export function moveNodeToRootEnd(
  nodes: PromptNode[],
  activeId: string,
): PromptNode[] {
  const [detachedNodes, extractedNode] = detachNode(nodes, activeId);
  if (!extractedNode) {
    return nodes;
  }

  return [...detachedNodes, extractedNode];
}
