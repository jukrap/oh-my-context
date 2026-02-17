import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type TooltipSide = 'top' | 'bottom';

interface TooltipTarget {
  element: HTMLElement;
  text: string;
  preferredSide: TooltipSide;
}

interface TooltipLayout {
  top: number;
  left: number;
  side: TooltipSide;
  arrowLeft: number;
}

const VIEWPORT_MARGIN = 10;
const TARGET_GAP = 10;
const HOVER_SHOW_DELAY_MS = 320;
const HIDDEN_LAYOUT_TOP = -10000;
const HIDDEN_LAYOUT_LEFT = -10000;

function getTooltipTargetFromNode(node: EventTarget | null): TooltipTarget | null {
  if (!(node instanceof Element)) {
    return null;
  }

  const target = node.closest<HTMLElement>('[data-tooltip]');
  if (!target) {
    return null;
  }

  const text = target.getAttribute('data-tooltip')?.trim() ?? '';
  if (!text) {
    return null;
  }

  const preferredSide = target.getAttribute('data-tooltip-side') === 'bottom' ? 'bottom' : 'top';

  return {
    element: target,
    text,
    preferredSide,
  };
}

function isTouchTooltipDisabled(target: HTMLElement): boolean {
  return target.getAttribute('data-tooltip-touch') === 'off';
}

export function TooltipLayer() {
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const targetRef = useRef<TooltipTarget | null>(null);
  const pendingTargetRef = useRef<TooltipTarget | null>(null);
  const showTimerRef = useRef<number | null>(null);
  const visibleRef = useRef(false);
  const suppressClickUntilRef = useRef(0);
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState('');
  const [layout, setLayout] = useState<TooltipLayout>({
    top: HIDDEN_LAYOUT_TOP,
    left: HIDDEN_LAYOUT_LEFT,
    side: 'top',
    arrowLeft: 12,
  });

  const hideTooltip = useCallback(() => {
    if (showTimerRef.current !== null) {
      window.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    pendingTargetRef.current = null;
    targetRef.current = null;
    setVisible(false);
    setText('');
    setLayout((prev) => ({
      ...prev,
      top: HIDDEN_LAYOUT_TOP,
      left: HIDDEN_LAYOUT_LEFT,
    }));
  }, []);

  const showTooltip = useCallback((target: TooltipTarget): void => {
    pendingTargetRef.current = null;
    targetRef.current = target;
    setLayout((prev) => ({
      ...prev,
      top: HIDDEN_LAYOUT_TOP,
      left: HIDDEN_LAYOUT_LEFT,
    }));
    setText(target.text);
    setVisible(true);
  }, []);

  const scheduleShow = useCallback(
    (target: TooltipTarget, delayMs: number): void => {
      if (showTimerRef.current !== null) {
        window.clearTimeout(showTimerRef.current);
      }

      pendingTargetRef.current = target;
      showTimerRef.current = window.setTimeout(() => {
        const pending = pendingTargetRef.current;
        showTimerRef.current = null;
        if (!pending) {
          return;
        }
        showTooltip(pending);
      }, delayMs);
    },
    [showTooltip],
  );

  const updateLayout = useCallback(() => {
    const tooltipElement = tooltipRef.current;
    const target = targetRef.current;
    if (!tooltipElement || !target || !document.body.contains(target.element)) {
      hideTooltip();
      return;
    }

    const rect = target.element.getBoundingClientRect();
    const tooltipRect = tooltipElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let side: TooltipSide = target.preferredSide;
    const topY = rect.top - tooltipRect.height - TARGET_GAP;
    const bottomY = rect.bottom + TARGET_GAP;

    if (side === 'top' && topY < VIEWPORT_MARGIN) {
      side = 'bottom';
    } else if (side === 'bottom' && bottomY + tooltipRect.height > viewportHeight - VIEWPORT_MARGIN) {
      side = 'top';
    }

    const unclampedTop = side === 'top' ? topY : bottomY;
    const top = Math.min(
      Math.max(unclampedTop, VIEWPORT_MARGIN),
      viewportHeight - tooltipRect.height - VIEWPORT_MARGIN,
    );

    const unclampedLeft = rect.left + rect.width / 2 - tooltipRect.width / 2;
    const left = Math.min(
      Math.max(unclampedLeft, VIEWPORT_MARGIN),
      viewportWidth - tooltipRect.width - VIEWPORT_MARGIN,
    );

    const arrowLeft = Math.min(
      Math.max(rect.left + rect.width / 2 - left, 12),
      Math.max(tooltipRect.width - 12, 12),
    );

    setLayout({
      top,
      left,
      side,
      arrowLeft,
    });
  }, [hideTooltip]);

  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  useEffect(() => {
    const handlePointerOver = (event: PointerEvent): void => {
      if (event.pointerType !== 'mouse') {
        return;
      }

      if (event.buttons !== 0) {
        hideTooltip();
        return;
      }

      const nextTarget = getTooltipTargetFromNode(event.target);
      if (!nextTarget) {
        hideTooltip();
        return;
      }

      if (
        targetRef.current?.element === nextTarget.element ||
        pendingTargetRef.current?.element === nextTarget.element
      ) {
        return;
      }

      targetRef.current = null;
      setVisible(false);
      setText('');
      scheduleShow(nextTarget, HOVER_SHOW_DELAY_MS);
    };

    const handlePointerDown = (event: PointerEvent): void => {
      const isTouchLike = event.pointerType === 'touch' || event.pointerType === 'pen';
      const nextTarget = getTooltipTargetFromNode(event.target);

      if (!isTouchLike) {
        hideTooltip();
        return;
      }

      suppressClickUntilRef.current = performance.now() + 500;
      if (!nextTarget) {
        hideTooltip();
        return;
      }

      if (isTouchTooltipDisabled(nextTarget.element)) {
        hideTooltip();
        return;
      }

      if (targetRef.current?.element === nextTarget.element && visibleRef.current) {
        hideTooltip();
        return;
      }

      showTooltip(nextTarget);
    };

    const handleClick = (event: MouseEvent): void => {
      if (performance.now() < suppressClickUntilRef.current) {
        return;
      }

      const nextTarget = getTooltipTargetFromNode(event.target);
      if (!nextTarget) {
        return;
      }

      if (isTouchTooltipDisabled(nextTarget.element)) {
        return;
      }

      showTooltip(nextTarget);
    };

    const handleFocusIn = (event: FocusEvent): void => {
      const nextTarget = getTooltipTargetFromNode(event.target);
      if (!nextTarget) {
        return;
      }
      showTooltip(nextTarget);
    };

    const handleFocusOut = (): void => {
      window.setTimeout(() => {
        const activeElement = document.activeElement;
        if (!activeElement) {
          hideTooltip();
          return;
        }

        const nextTarget = getTooltipTargetFromNode(activeElement);
        if (!nextTarget) {
          hideTooltip();
          return;
        }

        showTooltip(nextTarget);
      }, 0);
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        hideTooltip();
      }
    };

    document.addEventListener('pointerover', handlePointerOver, true);
    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('focusin', handleFocusIn, true);
    document.addEventListener('focusout', handleFocusOut, true);
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('pointerover', handlePointerOver, true);
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('focusin', handleFocusIn, true);
      document.removeEventListener('focusout', handleFocusOut, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      if (showTimerRef.current !== null) {
        window.clearTimeout(showTimerRef.current);
      }
    };
  }, [hideTooltip, scheduleShow, showTooltip]);

  useLayoutEffect(() => {
    if (!visible) {
      return;
    }

    const handleWindowChange = (): void => {
      updateLayout();
    };

    const rafId = window.requestAnimationFrame(handleWindowChange);
    window.addEventListener('resize', handleWindowChange);
    window.addEventListener('scroll', handleWindowChange, true);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleWindowChange);
      window.removeEventListener('scroll', handleWindowChange, true);
    };
  }, [updateLayout, visible, text]);

  if (!visible || !text) {
    return null;
  }

  return createPortal(
    <div
      aria-live="polite"
      className="omc-floating-tooltip"
      data-side={layout.side}
      ref={tooltipRef}
      role="tooltip"
      style={{ top: layout.top, left: layout.left }}
    >
      {text}
      <span className="omc-floating-tooltip-arrow" style={{ left: layout.arrowLeft }} />
    </div>,
    document.body,
  );
}
