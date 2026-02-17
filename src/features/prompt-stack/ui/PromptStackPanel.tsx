import {
  DndContext,
  type DragOverEvent,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  ChevronDown,
  ChevronRight,
  Copy,
  GripVertical,
  Plus,
  Trash2,
} from 'lucide-react';
import { type KeyboardEvent, useMemo, useState } from 'react';
import { buildNodeVisibilitySet, flattenVisibleNodeIds } from '../../../entities/prompt-node/model/tree';
import type { PromptNode } from '../../../entities/prompt-node/model/types';
import { useI18n } from '../../../shared/lib/i18n/useI18n';
import { Input } from '../../../shared/ui/Input';
import { Panel } from '../../../shared/ui/Panel';
import { selectActiveDocument, useAppStore } from '../../../shared/model/store';

interface TreeListProps {
  nodes: PromptNode[];
  depth: number;
  visibleNodeIds: Set<string>;
  activeDropId: string | null;
}

type DropPosition = 'before' | 'inside' | 'after';

type DropTarget = { kind: 'node'; nodeId: string; position: DropPosition };

function buildNodeDropId(nodeId: string, position: DropPosition): string {
  return `node:${nodeId}:${position}`;
}

function parseDropTarget(dropId: string | null): DropTarget | null {
  if (!dropId) {
    return null;
  }

  const parts = dropId.split(':');
  if (parts.length !== 3 || parts[0] !== 'node') {
    return null;
  }

  const nodeId = parts[1];
  const position = parts[2];
  if (!nodeId || !position) {
    return null;
  }

  if (position !== 'before' && position !== 'inside' && position !== 'after') {
    return null;
  }

  return {
    kind: 'node',
    nodeId,
    position,
  };
}

function DepthGuides({ depth }: { depth: number }) {
  if (depth === 0) {
    return <div className="stack-depth-guides" />;
  }

  return (
    <div aria-hidden className="stack-depth-guides">
      {Array.from({ length: depth }).map((_, index) => (
        <span
          className="stack-depth-guide"
          key={`${depth}-${index}`}
          style={{
            opacity: Math.min(0.32 + index * 0.1, 0.75),
          }}
        />
      ))}
    </div>
  );
}

function DropSlot({
  dropId,
  activeDropId,
  depth,
  variant,
}: {
  dropId: string;
  activeDropId: string | null;
  depth: number;
  variant: 'before' | 'after';
}) {
  const { setNodeRef } = useDroppable({
    id: dropId,
  });

  return (
    <div
      ref={setNodeRef}
      className="stack-drop-slot"
      data-active={activeDropId === dropId}
      data-variant={variant}
      style={{
        marginLeft: depth * 14 + 18,
      }}
    />
  );
}

function DraggableNodeRow({
  node,
  depth,
  activeDropId,
}: {
  node: PromptNode;
  depth: number;
  activeDropId: string | null;
}) {
  const { t } = useI18n();
  const selectedNodeId = useAppStore((state) => state.selectedNodeId);
  const setSelectedNodeId = useAppStore((state) => state.setSelectedNodeId);
  const addChildNode = useAppStore((state) => state.addChildNode);
  const duplicateNode = useAppStore((state) => state.duplicateNode);
  const deleteNode = useAppStore((state) => state.deleteNode);
  const toggleNodeEnabled = useAppStore((state) => state.toggleNodeEnabled);
  const toggleNodeCollapsed = useAppStore((state) => state.toggleNodeCollapsed);

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
    isDragging
  } = useDraggable({
    id: node.id,
  });

  const { setNodeRef: setInsideDroppableRef } = useDroppable({
    id: buildNodeDropId(node.id, 'inside'),
  });

  const setCardRef = (element: HTMLElement | null): void => {
    setDraggableRef(element);
    setInsideDroppableRef(element);
  };

  const metaText = t('nodeMeta', {
    mode: node.contentMode,
    children: node.children.length,
    state: node.enabled ? t('stateEnabled') : t('stateDisabled'),
  });

  return (
    <div className="stack-node-row" data-selected={selectedNodeId === node.id}>
      <DepthGuides depth={depth} />
      <article
        className="stack-node-card"
        data-disabled={!node.enabled}
        data-drop-active={activeDropId === buildNodeDropId(node.id, 'inside')}
        data-selected={selectedNodeId === node.id}
        ref={setCardRef}
        style={{
          opacity: isDragging ? 0.45 : 1,
          transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
        }}
      >
        <div className="stack-node-main">
          <div className="stack-node-main-left">
            <button
              className="stack-drag-handle"
              type="button"
              aria-label={t('dragNode')}
              {...attributes}
              {...listeners}
            >
              <GripVertical size={14} />
            </button>

            <button
              className="stack-enable-toggle"
              aria-label={t('enableNode')}
              data-enabled={node.enabled}
              onClick={() => toggleNodeEnabled(node.id)}
              type="button"
            >
              {node.enabled ? 'ON' : 'OFF'}
            </button>

            {node.children.length > 0 ? (
              <button
                className="stack-collapse-toggle"
                type="button"
                aria-label={node.collapsed ? t('expandNode') : t('collapseNode')}
                onClick={() => toggleNodeCollapsed(node.id)}
              >
                {node.collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              </button>
            ) : (
              <span className="stack-collapse-placeholder" />
            )}

            <button
              className="stack-node-label"
              data-selected={selectedNodeId === node.id}
              onClick={() => setSelectedNodeId(node.id)}
              title={`<${node.tagName}>`}
              type="button"
            >
              &lt;{node.tagName}&gt;
            </button>
          </div>

          <div className="stack-node-actions">
            <button
              aria-label={t('addChild')}
              className="stack-mini-action"
              onClick={() => addChildNode(node.id)}
              title={t('addChild')}
              type="button"
            >
              <Plus size={14} />
            </button>
            <button
              aria-label={t('duplicate')}
              className="stack-mini-action"
              onClick={() => duplicateNode(node.id)}
              title={t('duplicate')}
              type="button"
            >
              <Copy size={14} />
            </button>
            <button
              aria-label={t('delete')}
              className="stack-mini-action danger"
              onClick={() => deleteNode(node.id)}
              title={t('delete')}
              type="button"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <p className="stack-node-meta">{metaText}</p>
      </article>
    </div>
  );
}

function TreeList({ nodes, depth, visibleNodeIds, activeDropId }: TreeListProps) {
  const visibleNodes = nodes.filter((node) => visibleNodeIds.has(node.id));
  if (visibleNodes.length === 0) {
    return null;
  }

  const lastNode = visibleNodes[visibleNodes.length - 1];
  if (!lastNode) {
    return null;
  }

  return (
    <>
      {visibleNodes.map((node) => (
        <div className="stack-node-wrap" key={node.id}>
          <DropSlot
            activeDropId={activeDropId}
            depth={depth}
            dropId={buildNodeDropId(node.id, 'before')}
            variant="before"
          />
          <DraggableNodeRow
            activeDropId={activeDropId}
            depth={depth}
            node={node}
          />
          {!node.collapsed ? (
            <TreeList
              activeDropId={activeDropId}
              depth={depth + 1}
              nodes={node.children}
              visibleNodeIds={visibleNodeIds}
            />
          ) : null}
        </div>
      ))}
      <DropSlot
        activeDropId={activeDropId}
        depth={depth}
        dropId={buildNodeDropId(lastNode.id, 'after')}
        variant="after"
      />
    </>
  );
}

export function PromptStackPanel() {
  const { t } = useI18n();
  const document = useAppStore(selectActiveDocument);
  const addRootNode = useAppStore((state) => state.addRootNode);
  const moveNodeByDropTarget = useAppStore((state) => state.moveNodeByDropTarget);
  const stackSearchQuery = useAppStore((state) => state.stackSearchQuery);
  const setStackSearchQuery = useAppStore((state) => state.setStackSearchQuery);
  const selectedNodeId = useAppStore((state) => state.selectedNodeId);
  const setSelectedNodeId = useAppStore((state) => state.setSelectedNodeId);
  const [activeDropId, setActiveDropId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const visibleNodeIds = useMemo(() => {
    if (!document) {
      return new Set<string>();
    }

    return buildNodeVisibilitySet(document.nodes, stackSearchQuery);
  }, [document, stackSearchQuery]);

  const navigationIds = useMemo(() => {
    if (!document) {
      return [];
    }

    return flattenVisibleNodeIds(document.nodes).filter((id) => visibleNodeIds.has(id));
  }, [document, visibleNodeIds]);

  const onDragEnd = (event: DragEndEvent): void => {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;
    const target = parseDropTarget(overId);
    setActiveDropId(null);

    if (!target) {
      return;
    }

    moveNodeByDropTarget(activeId, target.nodeId, target.position);
  };

  const onDragOver = (event: DragOverEvent): void => {
    const overId = event.over ? String(event.over.id) : null;
    setActiveDropId(overId);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (navigationIds.length === 0) {
      return;
    }

    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
      return;
    }

    event.preventDefault();

    const currentIndex = selectedNodeId
      ? navigationIds.indexOf(selectedNodeId)
      : -1;

    const nextIndex =
      event.key === 'ArrowDown'
        ? Math.min(currentIndex + 1, navigationIds.length - 1)
        : Math.max(currentIndex - 1, 0);

    const nextId = navigationIds[nextIndex];
    if (nextId) {
      setSelectedNodeId(nextId);
    }
  };

  if (!document) {
    return <Panel title={t('contextStack')}>{t('noActiveDocument')}</Panel>;
  }

  return (
    <Panel
      rightSlot={
        <button
          className="omc-btn omc-btn-brand"
          type="button"
          onClick={addRootNode}
        >
          {t('addNode')}
        </button>
      }
      title={t('contextStack')}
    >
      <Input
        onChange={(event) => setStackSearchQuery(event.target.value)}
        placeholder={t('searchTagOrContent')}
        value={stackSearchQuery}
      />

      <div className="stack-tree-root" onKeyDown={onKeyDown} tabIndex={0}>
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          sensors={sensors}
        >
          <TreeList
            activeDropId={activeDropId}
            depth={0}
            nodes={document.nodes}
            visibleNodeIds={visibleNodeIds}
          />
        </DndContext>
      </div>
    </Panel>
  );
}
