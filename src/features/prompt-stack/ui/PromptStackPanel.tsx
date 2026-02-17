import {
  DndContext,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { buildNodeVisibilitySet, flattenVisibleNodeIds } from '../../../entities/prompt-node/model/tree';
import { useI18n } from '../../../shared/lib/i18n/useI18n';
import { selectActiveDocument, useAppStore } from '../../../shared/model/store';
import { Input } from '../../../shared/ui/Input';
import { Panel } from '../../../shared/ui/Panel';
import { computeAutoScrollDelta } from '../model/auto-scroll';
import {
  STACK_DRAG_AUTOSCROLL_EDGE_PX,
  STACK_DRAG_AUTOSCROLL_MAX_STEP_PX,
  STACK_MOUSE_DRAG_DISTANCE_PX,
  STACK_TOUCH_DRAG_DELAY_MS,
  STACK_TOUCH_DRAG_TOLERANCE_PX,
} from '../model/constants';
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
  const stackRootRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const pointerYRef = useRef<number | null>(null);
  const autoScrollTimerRef = useRef<number | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: STACK_MOUSE_DRAG_DISTANCE_PX,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: STACK_TOUCH_DRAG_DELAY_MS,
        tolerance: STACK_TOUCH_DRAG_TOLERANCE_PX,
      },
    }),
  );

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

  const stopAutoScroll = useCallback((): void => {
    isDraggingRef.current = false;
    pointerYRef.current = null;
    if (autoScrollTimerRef.current !== null) {
      window.clearInterval(autoScrollTimerRef.current);
      autoScrollTimerRef.current = null;
    }
  }, []);

  const runAutoScrollStep = useCallback((): void => {
    const root = stackRootRef.current;
    const pointerY = pointerYRef.current;
    if (!root || !isDraggingRef.current || pointerY === null) {
      return;
    }

    const delta = computeAutoScrollDelta(
      pointerY,
      root.getBoundingClientRect(),
      STACK_DRAG_AUTOSCROLL_EDGE_PX,
      STACK_DRAG_AUTOSCROLL_MAX_STEP_PX,
    );

    if (delta !== 0) {
      const nextTop = Math.min(
        Math.max(root.scrollTop + delta, 0),
        Math.max(root.scrollHeight - root.clientHeight, 0),
      );
      root.scrollTop = nextTop;
    }
  }, []);

  const startAutoScroll = useCallback((clientY: number): void => {
    pointerYRef.current = clientY;
    if (autoScrollTimerRef.current !== null) {
      return;
    }
    autoScrollTimerRef.current = window.setInterval(runAutoScrollStep, 16);
  }, [runAutoScrollStep]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent): void => {
      if (!isDraggingRef.current) {
        return;
      }
      startAutoScroll(event.clientY);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      stopAutoScroll();
    };
  }, [startAutoScroll, stopAutoScroll]);

  const onDragStart = (event: DragStartEvent): void => {
    isDraggingRef.current = true;
    const activator = event.activatorEvent;

    if (activator instanceof MouseEvent) {
      startAutoScroll(activator.clientY);
      return;
    }

    if (activator instanceof TouchEvent) {
      const touch = activator.touches[0] ?? activator.changedTouches[0];
      if (touch) {
        startAutoScroll(touch.clientY);
      }
    }
  };

  const onDragEnd = (event: DragEndEvent): void => {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;
    const target = parseDropTarget(overId);
    setActiveDropId(null);
    stopAutoScroll();

    if (!target) {
      return;
    }

    moveNodeByDropTarget(activeId, target.nodeId, target.position);
  };

  const onDragOver = (event: DragOverEvent): void => {
    const overId = event.over ? String(event.over.id) : null;
    setActiveDropId(overId);
  };

  const onDragCancel = (): void => {
    setActiveDropId(null);
    stopAutoScroll();
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

      <div className="stack-tree-root" onKeyDown={onKeyDown} ref={stackRootRef} tabIndex={0}>
        <DndContext
          autoScroll={false}
          collisionDetection={closestCenter}
          onDragCancel={onDragCancel}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          onDragStart={onDragStart}
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
