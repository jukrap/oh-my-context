import { type CSSProperties } from 'react';
import {
  CircleOff,
  CirclePower,
  ChevronDown,
  ChevronRight,
  Copy,
  GripVertical,
  Plus,
  Trash2,
} from 'lucide-react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import type { PromptNode } from '../../../entities/prompt-node/model/types';
import { useI18n } from '../../../shared/lib/i18n/useI18n';
import { useAppStore } from '../../../shared/model/store';
import { buildNodeDropId } from '../model/dnd';
import { STACK_MAX_VISIBLE_GUIDE_DEPTH, getDepthColor } from '../model/constants';

interface TreeListProps {
  nodes: PromptNode[];
  depth: number;
  ancestorLines: boolean[];
  visibleNodeIds: Set<string>;
  activeDropId: string | null;
}

interface StackTreeProps {
  nodes: PromptNode[];
  visibleNodeIds: Set<string>;
  activeDropId: string | null;
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

  // From stage 10+, keep only pass-through ancestor lines and omit deep connector branches.
  const hideDeepConnectorDepth = STACK_MAX_VISIBLE_GUIDE_DEPTH + 1;
  const isDeepOverflow = depth >= hideDeepConnectorDepth;

  const visibleAncestorLines = isDeepOverflow
    ? ancestorLines.slice(0, STACK_MAX_VISIBLE_GUIDE_DEPTH)
    : ancestorLines.slice(-STACK_MAX_VISIBLE_GUIDE_DEPTH);
  const startDepth = isDeepOverflow ? 0 : Math.max(depth - visibleAncestorLines.length, 0);
  const parentDepth = Math.max(depth - 1, 0);
  const connectorColor = getDepthColor(parentDepth);

  return (
    <div aria-hidden className="stack-branch-guides">
      {visibleAncestorLines.map((hasLine, index) => (
        <span
          className="stack-branch-column"
          data-active={hasLine && !(startDepth === 0 && index === 0)}
          key={`${depth}-${index}`}
          style={
            {
              ['--branch-color' as string]: getDepthColor(startDepth + index),
            } as CSSProperties
          }
        />
      ))}
      {isDeepOverflow ? (
        <span className="stack-branch-connector stack-branch-connector-omitted">
          <span className="stack-branch-overflow-marker">...</span>
        </span>
      ) : (
        <span
          className="stack-branch-connector"
          data-last={isLast}
          style={{ ['--branch-color' as string]: connectorColor } as CSSProperties}
        >
          <span className="stack-branch-horizontal" />
        </span>
      )}
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
  const clampedDepth = Math.min(depth, STACK_MAX_VISIBLE_GUIDE_DEPTH);

  return (
    <div
      ref={setNodeRef}
      className="stack-drop-slot"
      data-active={activeDropId === dropId}
      data-variant={variant}
      style={{
        marginLeft: clampedDepth * 14 + (clampedDepth > 0 ? 15 : 18),
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
  const newlyCreatedNodeId = useAppStore((state) => state.newlyCreatedNodeId);
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
    transform: transform ? `translate3d(0, ${transform.y}px, 0)` : undefined,
    marginLeft: depth > 0 ? '-5px' : undefined,
  };
  const isRecentlyCreated = newlyCreatedNodeId === node.id;

  return (
    <div className="stack-node-row" data-selected={selectedNodeId === node.id}>
      <BranchGuides ancestorLines={ancestorLines} depth={depth} isLast={isLast} />
      <article
        className="stack-node-card"
        data-disabled={!node.enabled}
        data-drop-active={activeDropId === buildNodeDropId(node.id, 'inside')}
        data-recent={isRecentlyCreated}
        data-selected={selectedNodeId === node.id}
        ref={setCardRef}
        style={cardStyle}
      >
        <div className="stack-node-main">
          <div className="stack-node-main-left">
            <button
              className="stack-drag-handle omc-tooltip-btn"
              type="button"
              aria-label={t('dragNode')}
              data-tooltip={t('dragNode')}
              data-tooltip-touch="off"
              {...attributes}
              {...listeners}
            >
              <GripVertical size={14} />
            </button>

            {node.children.length > 0 ? (
              <button
                className="stack-collapse-toggle omc-tooltip-btn"
                type="button"
                aria-label={node.collapsed ? t('expandNode') : t('collapseNode')}
                data-tooltip={node.collapsed ? t('expandNode') : t('collapseNode')}
                onClick={() => toggleNodeCollapsed(node.id)}
              >
                {node.collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              </button>
            ) : (
              <span className="stack-collapse-placeholder" />
            )}

            <button
              className="stack-node-label omc-tooltip-btn"
              data-selected={selectedNodeId === node.id}
              data-tooltip={`<${node.tagName}>`}
              onClick={() => setSelectedNodeId(node.id)}
              type="button"
            >
              &lt;{node.tagName}&gt;
            </button>
          </div>

          <div className="stack-node-actions">
            <button
              aria-label={t('enableNode')}
              className="stack-enable-toggle omc-tooltip-btn"
              data-enabled={node.enabled}
              data-tooltip={`${t('enableNode')}: ${node.enabled ? t('stateEnabled') : t('stateDisabled')}`}
              onClick={() => toggleNodeEnabled(node.id)}
              type="button"
            >
              {node.enabled ? <CirclePower size={14} /> : <CircleOff size={14} />}
              <span className="sr-only">{node.enabled ? t('stateEnabled') : t('stateDisabled')}</span>
            </button>
            <button
              aria-label={t('addChild')}
              className="stack-mini-action omc-tooltip-btn"
              data-tooltip={t('addChild')}
              onClick={() => addChildNode(node.id)}
              type="button"
            >
              <Plus size={14} />
            </button>
            <button
              aria-label={t('duplicate')}
              className="stack-mini-action omc-tooltip-btn"
              data-tooltip={t('duplicate')}
              onClick={() => duplicateNode(node.id)}
              type="button"
            >
              <Copy size={14} />
            </button>
            <button
              aria-label={t('delete')}
              className="stack-mini-action danger omc-tooltip-btn"
              data-tooltip={t('delete')}
              onClick={() => deleteNode(node.id)}
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

export function StackTree({ nodes, visibleNodeIds, activeDropId }: StackTreeProps) {
  return (
    <TreeList
      activeDropId={activeDropId}
      ancestorLines={[]}
      depth={0}
      nodes={nodes}
      visibleNodeIds={visibleNodeIds}
    />
  );
}
