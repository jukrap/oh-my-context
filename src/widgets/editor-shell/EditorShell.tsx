import { NodeEditorPanel } from '../../features/node-editor/ui/NodeEditorPanel';
import { PreviewPanel } from '../../features/preview-export/ui/PreviewPanel';
import { PromptStackPanel } from '../../features/prompt-stack/ui/PromptStackPanel';
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
  const activeDocument = useAppStore(selectActiveDocument);
  const leftPanelWidth = useAppStore((state) => state.leftPanelWidth);
  const rightPanelWidth = useAppStore((state) => state.rightPanelWidth);
  const saveStatus = useAppStore((state) => state.saveStatus);
  const lastSavedAt = useAppStore((state) => state.lastSavedAt);
  const hydrated = useAppStore((state) => state.hydrated);

  const saveStatusLabel =
    saveStatus === 'saving'
      ? 'Saving...'
      : saveStatus === 'saved'
        ? `Saved ${lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString() : ''}`
        : saveStatus === 'error'
          ? 'Error'
          : 'Idle';

  return (
    <div className="editor-shell">
      <header className="editor-topbar">
        <div className="app-title-group">
          <h1>Oh My Context!</h1>
          <p>Context Stack Editor for XML Prompts</p>
        </div>

        <nav className="topbar-nav">
          <Button
            onClick={() =>
              activeDrawer === '/vault' ? onCloseDrawer() : onOpenDrawer('/vault')
            }
            tone={activeDrawer === '/vault' ? 'brand' : 'default'}
          >
            Vault
          </Button>
          <Button
            onClick={() =>
              activeDrawer === '/includes'
                ? onCloseDrawer()
                : onOpenDrawer('/includes')
            }
            tone={activeDrawer === '/includes' ? 'brand' : 'default'}
          >
            Includes
          </Button>
          <Button
            onClick={() =>
              activeDrawer === '/templates'
                ? onCloseDrawer()
                : onOpenDrawer('/templates')
            }
            tone={activeDrawer === '/templates' ? 'brand' : 'default'}
          >
            Templates
          </Button>
          <Button
            onClick={() =>
              activeDrawer === '/settings'
                ? onCloseDrawer()
                : onOpenDrawer('/settings')
            }
            tone={activeDrawer === '/settings' ? 'brand' : 'default'}
          >
            Settings
          </Button>
        </nav>

        <div className="save-status">
          <span>{activeDocument ? activeDocument.name : 'No document'}</span>
          <strong>{saveStatusLabel}</strong>
        </div>
      </header>

      {!hydrated ? (
        <main className="loading-state">Loading workspace...</main>
      ) : (
        <main
          className="editor-grid"
          style={{
            gridTemplateColumns: `${leftPanelWidth}px minmax(320px, 1fr) ${rightPanelWidth}px`,
          }}
        >
          <PromptStackPanel />
          <NodeEditorPanel />
          <PreviewPanel />
        </main>
      )}
    </div>
  );
}
