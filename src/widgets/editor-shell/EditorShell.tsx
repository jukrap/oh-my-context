import { type MouseEvent as ReactMouseEvent } from 'react';
import { NodeEditorPanel } from '../../features/node-editor/ui/NodeEditorPanel';
import { PreviewPanel } from '../../features/preview-export/ui/PreviewPanel';
import { PromptStackPanel } from '../../features/prompt-stack/ui/PromptStackPanel';
import { useI18n } from '../../shared/lib/i18n/useI18n';
import { useRuntimeStore } from '../../shared/model/runtime-store';
import { selectActiveDocument, useAppStore } from '../../shared/model/store';
import { Button } from '../../shared/ui/Button';

type DrawerPath = '/vault' | '/includes' | '/templates' | '/settings';

interface EditorShellProps {
  activeDrawer: DrawerPath | null;
  onOpenDrawer: (path: DrawerPath) => void;
  onCloseDrawer: () => void;
}

export function EditorShell({
  activeDrawer,
  onOpenDrawer,
  onCloseDrawer,
}: EditorShellProps) {
  const { language, t } = useI18n();
  const activeDocument = useAppStore(selectActiveDocument);
  const leftPanelWidth = useAppStore((state) => state.leftPanelWidth);
  const rightPanelWidth = useAppStore((state) => state.rightPanelWidth);
  const setLeftPanelWidth = useAppStore((state) => state.setLeftPanelWidth);
  const setRightPanelWidth = useAppStore((state) => state.setRightPanelWidth);
  const saveStatus = useRuntimeStore((state) => state.saveStatus);
  const lastSavedAt = useRuntimeStore((state) => state.lastSavedAt);
  const hydrated = useRuntimeStore((state) => state.hydrated);

  const MIN_LEFT_WIDTH = 440;
  const MAX_LEFT_WIDTH = 760;
  const MIN_RIGHT_WIDTH = 360;
  const MAX_RIGHT_WIDTH = 700;
  const MIN_CENTER_WIDTH = 320;
  const VIEWPORT_PADDING = 96;

  const clamp = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
  };

  const startResize =
    (target: 'left' | 'right') =>
    (event: ReactMouseEvent<HTMLDivElement>): void => {
      event.preventDefault();

      const startX = event.clientX;
      const startLeft = leftPanelWidth;
      const startRight = rightPanelWidth;

      const onMove = (moveEvent: MouseEvent): void => {
        const deltaX = moveEvent.clientX - startX;

        if (target === 'left') {
          const maxByViewport =
            window.innerWidth - startRight - MIN_CENTER_WIDTH - VIEWPORT_PADDING;
          const nextLeft = clamp(
            startLeft + deltaX,
            MIN_LEFT_WIDTH,
            Math.min(MAX_LEFT_WIDTH, maxByViewport),
          );
          setLeftPanelWidth(nextLeft);
          return;
        }

        const maxByViewport =
          window.innerWidth - startLeft - MIN_CENTER_WIDTH - VIEWPORT_PADDING;
        const nextRight = clamp(
          startRight - deltaX,
          MIN_RIGHT_WIDTH,
          Math.min(MAX_RIGHT_WIDTH, maxByViewport),
        );
        setRightPanelWidth(nextRight);
      };

      const onUp = (): void => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    };

  const saveStatusLabel =
    saveStatus === 'saving'
      ? t('saveSaving')
      : saveStatus === 'saved'
        ? t('saveSaved', {
            time: lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString() : '',
          })
        : saveStatus === 'error'
          ? t('saveError')
          : t('saveIdle');

  const leftResizeHint =
    language === 'ko'
      ? '좌우로 드래그해서 Context Stack 너비를 조절합니다.'
      : 'Drag horizontally to resize Context Stack width.';
  const rightResizeHint =
    language === 'ko'
      ? '좌우로 드래그해서 Preview / Export 너비를 조절합니다.'
      : 'Drag horizontally to resize Preview / Export width.';

  return (
    <div className="editor-shell">
      <header className="editor-topbar">
        <div className="app-title-group">
          <h1>Oh My Context!</h1>
          <p>{t('appTagline')}</p>
        </div>

        <nav className="topbar-nav">
          <Button
            onClick={() =>
              activeDrawer === '/vault' ? onCloseDrawer() : onOpenDrawer('/vault')
            }
            tone={activeDrawer === '/vault' ? 'brand' : 'default'}
          >
            {t('navVault')}
          </Button>
          <Button
            onClick={() =>
              activeDrawer === '/includes'
                ? onCloseDrawer()
                : onOpenDrawer('/includes')
            }
            tone={activeDrawer === '/includes' ? 'brand' : 'default'}
          >
            {t('navIncludes')}
          </Button>
          <Button
            onClick={() =>
              activeDrawer === '/templates'
                ? onCloseDrawer()
                : onOpenDrawer('/templates')
            }
            tone={activeDrawer === '/templates' ? 'brand' : 'default'}
          >
            {t('navTemplates')}
          </Button>
          <Button
            onClick={() =>
              activeDrawer === '/settings'
                ? onCloseDrawer()
                : onOpenDrawer('/settings')
            }
            tone={activeDrawer === '/settings' ? 'brand' : 'default'}
          >
            {t('navSettings')}
          </Button>
        </nav>

        <div className="save-status-wrap">
          <div className="save-status">
            <span>{activeDocument ? activeDocument.name : t('noActiveDocument')}</span>
            <strong>{saveStatusLabel}</strong>
          </div>
        </div>
      </header>

      {!hydrated ? (
        <main className="loading-state">{t('loadingWorkspace')}</main>
      ) : (
        <main
          className="editor-grid"
          style={{
            gridTemplateColumns: `${leftPanelWidth}px 12px minmax(280px, 1fr) 12px ${rightPanelWidth}px`,
          }}
        >
          <PromptStackPanel />
          <div
            aria-label="Resize context stack panel"
            className="panel-splitter omc-tooltip-btn"
            data-tooltip={leftResizeHint}
            onMouseDown={startResize('left')}
            role="separator"
          />
          <NodeEditorPanel />
          <div
            aria-label="Resize preview panel"
            className="panel-splitter omc-tooltip-btn"
            data-tooltip={rightResizeHint}
            onMouseDown={startResize('right')}
            role="separator"
          />
          <PreviewPanel />
        </main>
      )}
    </div>
  );
}
