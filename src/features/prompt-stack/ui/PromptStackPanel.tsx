import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { type KeyboardEvent, useMemo } from 'react';
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
}

function SortableNodeRow({ node, depth }: { node: PromptNode; depth: number }) {
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
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: node.id,
  });

  const metaText = t('nodeMeta', {
    mode: node.contentMode,
    children: node.children.length,
    state: node.enabled ? t('stateEnabled') : t('stateDisabled'),
  });

  return (
    <div
      ref={setNodeRef}
      className="stack-node-row"
      data-selected={selectedNodeId === node.id}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        transition,
        opacity: isDragging ? 0.7 : 1,
      }}
    >
      <div
        aria-hidden
        className="stack-depth-strip"
        style={{ width: `${depth * 16}px` }}
      />
      <article className="stack-node-card" data-disabled={!node.enabled} data-selected={selectedNodeId === node.id}>
        <div className="stack-node-main">
          <div className="stack-node-main-left">
            <button
              className="stack-drag-handle"
              type="button"
              aria-label={t('dragNode')}
              {...attributes}
              {...listeners}
            >
              ::
            </button>

            <input
              aria-label={t('enableNode')}
              checked={node.enabled}
              onChange={() => toggleNodeEnabled(node.id)}
              type="checkbox"
            />

            {node.children.length > 0 ? (
              <button
                className="stack-collapse-toggle"
                type="button"
                aria-label={node.collapsed ? t('expandNode') : t('collapseNode')}
                onClick={() => toggleNodeCollapsed(node.id)}
              >
                {node.collapsed ? '+' : '-'}
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
              +
            </button>
            <button
              aria-label={t('duplicate')}
              className="stack-mini-action"
              onClick={() => duplicateNode(node.id)}
              title={t('duplicate')}
              type="button"
            >
              2x
            </button>
            <button
              aria-label={t('delete')}
              className="stack-mini-action danger"
              onClick={() => deleteNode(node.id)}
              title={t('delete')}
              type="button"
            >
              x
            </button>
          </div>
        </div>

        <p className="stack-node-meta">{metaText}</p>
      </article>
    </div>
  );
}

function TreeList({ nodes, depth, visibleNodeIds }: TreeListProps) {
  const visibleNodes = nodes.filter((node) => visibleNodeIds.has(node.id));
  if (visibleNodes.length === 0) {
    return null;
  }

  return (
    <SortableContext
      items={visibleNodes.map((node) => node.id)}
      strategy={verticalListSortingStrategy}
    >
      {visibleNodes.map((node) => (
        <div className="stack-node-wrap" key={node.id}>
          <SortableNodeRow depth={depth} node={node} />
          {!node.collapsed ? (
            <TreeList
              depth={depth + 1}
              nodes={node.children}
              visibleNodeIds={visibleNodeIds}
            />
          ) : null}
        </div>
      ))}
    </SortableContext>
  );
}

export function PromptStackPanel() {
  const { t } = useI18n();
  const document = useAppStore(selectActiveDocument);
  const addRootNode = useAppStore((state) => state.addRootNode);
  const moveNodeWithinParent = useAppStore((state) => state.moveNodeWithinParent);
  const stackSearchQuery = useAppStore((state) => state.stackSearchQuery);
  const setStackSearchQuery = useAppStore((state) => state.setStackSearchQuery);
  const selectedNodeId = useAppStore((state) => state.selectedNodeId);
  const setSelectedNodeId = useAppStore((state) => state.setSelectedNodeId);

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

    if (!overId || activeId === overId) {
      return;
    }

    moveNodeWithinParent(activeId, overId);
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
          sensors={sensors}
        >
          <TreeList depth={0} nodes={document.nodes} visibleNodeIds={visibleNodeIds} />
        </DndContext>
      </div>
    </Panel>
  );
}
