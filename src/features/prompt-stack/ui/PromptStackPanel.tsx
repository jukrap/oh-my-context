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
  Crosshair,
  GripVertical,
  ListTree,
  Plus,
  Tag,
  Trash2,
} from 'lucide-react';
import { type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { buildNodeVisibilitySet, flattenVisibleNodeIds } from '../../../entities/prompt-node/model/tree';
import type { PromptNode } from '../../../entities/prompt-node/model/types';
import type { TranslationKey } from '../../../shared/lib/i18n/messages';
import { useI18n } from '../../../shared/lib/i18n/useI18n';
import { Input } from '../../../shared/ui/Input';
import { Panel } from '../../../shared/ui/Panel';
import { selectActiveDocument, selectSelectedNode, useAppStore } from '../../../shared/model/store';

interface TreeListProps {
  nodes: PromptNode[];
  depth: number;
  ancestorLines: boolean[];
  visibleNodeIds: Set<string>;
  activeDropId: string | null;
}

type DropPosition = 'before' | 'inside' | 'after';

type DropTarget = { kind: 'node'; nodeId: string; position: DropPosition };

const STACK_DEPTH_COLORS = [
  'var(--stack-depth-0)',
  'var(--stack-depth-1)',
  'var(--stack-depth-2)',
  'var(--stack-depth-3)',
  'var(--stack-depth-4)',
  'var(--stack-depth-5)',
  'var(--stack-depth-6)',
  'var(--stack-depth-7)',
  'var(--stack-depth-8)',
  'var(--stack-depth-9)',
  'var(--stack-depth-10)',
  'var(--stack-depth-11)',
];

const RECOMMENDED_NODE_TAGS = [
  { value: 'instruction', descriptionKey: 'recommendedInstructionDesc' },
  { value: 'constraints', descriptionKey: 'recommendedConstraintsDesc' },
  { value: 'context', descriptionKey: 'recommendedContextDesc' },
  { value: 'examples', descriptionKey: 'recommendedExamplesDesc' },
  { value: 'output_format', descriptionKey: 'recommendedOutputFormatDesc' },
  { value: 'checklist', descriptionKey: 'recommendedChecklistDesc' },
] as const satisfies ReadonlyArray<{
  value: string;
  descriptionKey: TranslationKey;
}>;
const DEFAULT_NODE_TAG = 'context';

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

function getDepthColor(depth: number): string {
  return STACK_DEPTH_COLORS[depth % STACK_DEPTH_COLORS.length] ?? 'var(--stack-depth-0)';
}

function BranchGuides({
  depth,
  ancestorLines,
  isLast,
}: {
  depth: number;
  ancestorLines: boolean[];
  isLast: boolean;
}) {
  if (depth === 0) {
    return <div aria-hidden className="stack-branch-guides" />;
  }

  const parentDepth = Math.max(depth - 1, 0);
  const connectorColor = getDepthColor(parentDepth);

  return (
    <div aria-hidden className="stack-branch-guides">
      {ancestorLines.map((hasLine, index) => (
        <span
          className="stack-branch-column"
          data-active={hasLine}
          key={`${depth}-${index}`}
          style={{ ['--branch-color' as string]: getDepthColor(index) } as CSSProperties}
        />
      ))}
      <span
        className="stack-branch-connector"
        data-last={isLast}
        style={{ ['--branch-color' as string]: connectorColor } as CSSProperties}
      >
        <span className="stack-branch-horizontal" />
      </span>
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
        marginLeft: depth * 14 + (depth > 0 ? 15 : 18),
      }}
    />
  );
}

function DraggableNodeRow({
  node,
  depth,
  activeDropId,
  ancestorLines,
  isLast,
}: {
  node: PromptNode;
  depth: number;
  activeDropId: string | null;
  ancestorLines: boolean[];
  isLast: boolean;
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
    isDragging,
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

  const cardStyle: CSSProperties = {
    opacity: isDragging ? 0.45 : 1,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    marginLeft: depth > 0 ? '-5px' : undefined,
  };

  return (
    <div className="stack-node-row" data-selected={selectedNodeId === node.id}>
      <BranchGuides ancestorLines={ancestorLines} depth={depth} isLast={isLast} />
      <article
        className="stack-node-card"
        data-disabled={!node.enabled}
        data-drop-active={activeDropId === buildNodeDropId(node.id, 'inside')}
        data-selected={selectedNodeId === node.id}
        ref={setCardRef}
        style={cardStyle}
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
              aria-label={t('enableNode')}
              className="stack-enable-toggle"
              data-enabled={node.enabled}
              onClick={() => toggleNodeEnabled(node.id)}
              title={t('enableNode')}
              type="button"
            >
              {node.enabled ? 'ON' : 'OFF'}
            </button>
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

        <p className="stack-node-meta">
          {metaText}
          {' | #'}
          {depth + 1}
        </p>
      </article>
    </div>
  );
}

function TreeList({
  nodes,
  depth,
  ancestorLines,
  visibleNodeIds,
  activeDropId,
}: TreeListProps) {
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
      {visibleNodes.map((node, index) => {
        const isLast = index === visibleNodes.length - 1;
        const nextAncestorLines = [...ancestorLines, !isLast];

        return (
          <div className="stack-node-wrap" key={node.id}>
            <DropSlot
              activeDropId={activeDropId}
              depth={depth}
              dropId={buildNodeDropId(node.id, 'before')}
              variant="before"
            />
            <DraggableNodeRow
              activeDropId={activeDropId}
              ancestorLines={ancestorLines}
              depth={depth}
              isLast={isLast}
              node={node}
            />
            {!node.collapsed ? (
              <TreeList
                activeDropId={activeDropId}
                ancestorLines={nextAncestorLines}
                depth={depth + 1}
                nodes={node.children}
                visibleNodeIds={visibleNodeIds}
              />
            ) : null}
          </div>
        );
      })}
      <DropSlot
        activeDropId={activeDropId}
        depth={depth}
        dropId={buildNodeDropId(lastNode.id, 'after')}
        variant="after"
      />
    </>
  );
}

function AddNodeMenu() {
  const { t } = useI18n();
  const addRootNode = useAppStore((state) => state.addRootNode);
  const addChildNode = useAppStore((state) => state.addChildNode);
  const selectedNode = useAppStore(selectSelectedNode);
  const [open, setOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState(DEFAULT_NODE_TAG);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const defaultTagItem =
    RECOMMENDED_NODE_TAGS.find((item) => item.value === DEFAULT_NODE_TAG) ??
    RECOMMENDED_NODE_TAGS[0];
  const extraTagItems = RECOMMENDED_NODE_TAGS.filter(
    (item) => item.value !== DEFAULT_NODE_TAG,
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent): void => {
      const container = menuRef.current;
      if (!container) {
        return;
      }

      if (event.target instanceof Node && !container.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleSelectTag = (tagName: string): void => {
    setSelectedTag(tagName);
    setOpen(false);
  };

  const handleAddNode = (target: 'root' | 'child'): void => {
    if (target === 'child') {
      if (!selectedNode) {
        return;
      }
      addChildNode(selectedNode.id, selectedTag);
      return;
    }

    addRootNode(selectedTag);
  };

  return (
    <div className="stack-add-menu" ref={menuRef}>
      <div className="stack-add-inline">
        <button
          aria-expanded={open}
          aria-label={t('selectAddTag')}
          className="omc-btn stack-tag-picker stack-tooltip-btn"
          data-tooltip={t('selectAddTag')}
          onClick={() => setOpen((prev) => !prev)}
          type="button"
        >
          <Tag size={14} />
          <span className="stack-tag-pill">{`<${selectedTag}>`}</span>
          <ChevronDown size={14} />
        </button>

        <button
          aria-label={t('addAtRoot')}
          className="omc-btn stack-add-inline-btn stack-add-root-btn stack-tooltip-btn"
          data-tooltip={t('addAtRoot')}
          onClick={() => handleAddNode('root')}
          type="button"
        >
          <ListTree size={14} />
        </button>

        <button
          aria-disabled={!selectedNode}
          aria-label={selectedNode ? t('addToSelected') : t('selectNodeFirst')}
          className="omc-btn stack-add-inline-btn stack-add-selected-btn stack-tooltip-btn"
          data-disabled={!selectedNode}
          data-tooltip={selectedNode ? t('addToSelected') : t('selectNodeFirst')}
          onClick={() => handleAddNode('child')}
          type="button"
        >
          <Crosshair size={14} />
        </button>
      </div>

      {open ? (
        <div className="stack-add-popover" role="menu">
          <p className="stack-add-section-title">{t('recommendedTags')}</p>

          {defaultTagItem ? (
            <button
              className="stack-add-item stack-add-item-default"
              data-selected={selectedTag === defaultTagItem.value}
              onClick={() => handleSelectTag(defaultTagItem.value)}
              type="button"
            >
              <span className="stack-add-item-head">
                <span className="stack-add-item-title">{'<context>'}</span>
                <span className="stack-add-badge">{t('defaultLabel')}</span>
              </span>
              <span className="stack-add-item-desc">
                {t(defaultTagItem.descriptionKey)}
              </span>
            </button>
          ) : null}

          <div className="stack-add-popover-divider" />
          <div className="stack-add-list">
            {extraTagItems.map((item) => (
              <button
                className="stack-add-item"
                data-selected={selectedTag === item.value}
                key={item.value}
                onClick={() => handleSelectTag(item.value)}
                type="button"
              >
                <span className="stack-add-item-title">
                  {'<'}
                  {item.value}
                  {'>'}
                </span>
                <span className="stack-add-item-desc">{t(item.descriptionKey)}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function PromptStackPanel() {
  const { t } = useI18n();
  const document = useAppStore(selectActiveDocument);
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

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
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
      rightSlot={<AddNodeMenu />}
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
            ancestorLines={[]}
            depth={0}
            nodes={document.nodes}
            visibleNodeIds={visibleNodeIds}
          />
        </DndContext>
      </div>
    </Panel>
  );
}
