import { type MouseEvent as ReactMouseEvent, useState } from 'react';
import { Blocks, Files, Settings, Shapes } from 'lucide-react';
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

type MobilePanel = 'stack' | 'editor' | 'preview';

export function EditorShell({
  activeDrawer,
  onOpenDrawer,
  onCloseDrawer,
}: EditorShellProps) {
  const { t } = useI18n();
  const activeDocument = useAppStore(selectActiveDocument);
  const leftPanelWidth = useAppStore((state) => state.leftPanelWidth);
  const rightPanelWidth = useAppStore((state) => state.rightPanelWidth);
  const setLeftPanelWidth = useAppStore((state) => state.setLeftPanelWidth);
  const setRightPanelWidth = useAppStore((state) => state.setRightPanelWidth);
  const saveStatus = useRuntimeStore((state) => state.saveStatus);
  const lastSavedAt = useRuntimeStore((state) => state.lastSavedAt);
  const hydrated = useRuntimeStore((state) => state.hydrated);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('stack');

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
            tooltip={t('hintNavVault')}
            tone={activeDrawer === '/vault' ? 'brand' : 'default'}
          >
            <Files size={14} />
            {t('navVault')}
          </Button>
          <Button
            onClick={() =>
              activeDrawer === '/includes'
                ? onCloseDrawer()
                : onOpenDrawer('/includes')
            }
            tooltip={t('hintNavIncludes')}
            tone={activeDrawer === '/includes' ? 'brand' : 'default'}
          >
            <Blocks size={14} />
            {t('navIncludes')}
          </Button>
          <Button
            onClick={() =>
              activeDrawer === '/templates'
                ? onCloseDrawer()
                : onOpenDrawer('/templates')
            }
            tooltip={t('hintNavTemplates')}
            tone={activeDrawer === '/templates' ? 'brand' : 'default'}
          >
            <Shapes size={14} />
            {t('navTemplates')}
          </Button>
          <Button
            onClick={() =>
              activeDrawer === '/settings'
                ? onCloseDrawer()
                : onOpenDrawer('/settings')
            }
            tooltip={t('hintNavSettings')}
            tone={activeDrawer === '/settings' ? 'brand' : 'default'}
          >
            <Settings size={14} />
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
        <>
          <div className="mobile-panel-switch" role="tablist">
            <button
              aria-selected={mobilePanel === 'stack'}
              className="mobile-panel-tab"
              data-active={mobilePanel === 'stack'}
              onClick={() => setMobilePanel('stack')}
              role="tab"
              type="button"
            >
              {t('mobilePanelStack')}
            </button>
            <button
              aria-selected={mobilePanel === 'editor'}
              className="mobile-panel-tab"
              data-active={mobilePanel === 'editor'}
              onClick={() => setMobilePanel('editor')}
              role="tab"
              type="button"
            >
              {t('mobilePanelEditor')}
            </button>
            <button
              aria-selected={mobilePanel === 'preview'}
              className="mobile-panel-tab"
              data-active={mobilePanel === 'preview'}
              onClick={() => setMobilePanel('preview')}
              role="tab"
              type="button"
            >
              {t('mobilePanelPreview')}
            </button>
          </div>

          <main
            className="editor-grid"
            data-mobile-panel={mobilePanel}
            style={{
              gridTemplateColumns: `${leftPanelWidth}px 12px minmax(280px, 1fr) 12px ${rightPanelWidth}px`,
            }}
          >
            <div className="editor-panel-slot" data-panel="stack">
              <PromptStackPanel />
            </div>
            <div
              aria-label="Resize context stack panel"
              className="panel-splitter omc-tooltip-btn"
              data-tooltip={t('hintResizeContextStack')}
              onMouseDown={startResize('left')}
              role="separator"
            />
            <div className="editor-panel-slot" data-panel="editor">
              <NodeEditorPanel />
            </div>
            <div
              aria-label="Resize preview panel"
              className="panel-splitter omc-tooltip-btn"
              data-tooltip={t('hintResizePreviewExport')}
              onMouseDown={startResize('right')}
              role="separator"
            />
            <div className="editor-panel-slot" data-panel="preview">
              <PreviewPanel />
            </div>
          </main>
        </>
      )}
    </div>
  );
}
