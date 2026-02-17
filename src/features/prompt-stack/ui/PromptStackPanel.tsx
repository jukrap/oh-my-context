import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { type KeyboardEvent as ReactKeyboardEvent, useMemo, useState } from 'react';
import { buildNodeVisibilitySet, flattenVisibleNodeIds } from '../../../entities/prompt-node/model/tree';
import { useI18n } from '../../../shared/lib/i18n/useI18n';
import { selectActiveDocument, useAppStore } from '../../../shared/model/store';
import { Input } from '../../../shared/ui/Input';
import { Panel } from '../../../shared/ui/Panel';
import { parseDropTarget } from '../model/dnd';
import { AddNodeMenu } from './AddNodeMenu';
import { StackTree } from './StackTree';

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
    <Panel rightSlot={<AddNodeMenu />} title={t('contextStack')}>
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
          <StackTree
            activeDropId={activeDropId}
            nodes={document.nodes}
            visibleNodeIds={visibleNodeIds}
          />
        </DndContext>
      </div>
    </Panel>
  );
}
