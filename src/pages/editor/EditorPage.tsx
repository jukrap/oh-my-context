import { useLocation, useNavigate } from 'react-router-dom';
import { useAutosaveLifecycle } from '../../features/autosave/model/useAutosaveLifecycle';
import { EditorShell } from '../../widgets/editor-shell/EditorShell';
import { IncludesDrawer } from '../../widgets/includes-drawer/IncludesDrawer';
import { SettingsDrawer } from '../../widgets/settings-drawer/SettingsDrawer';
import { TemplatesDrawer } from '../../widgets/templates-drawer/TemplatesDrawer';
import { VaultDrawer } from '../../widgets/vault-drawer/VaultDrawer';

type DrawerPath = '/vault' | '/includes' | '/templates' | '/settings';

function resolveDrawerPath(pathname: string): DrawerPath | null {
  if (
    pathname === '/vault' ||
    pathname === '/includes' ||
    pathname === '/templates' ||
    pathname === '/settings'
  ) {
    return pathname;
  }

  return null;
}

export function EditorPage() {
  useAutosaveLifecycle();

  const location = useLocation();
  const navigate = useNavigate();
  const activeDrawer = resolveDrawerPath(location.pathname);

  return (
    <>
      <EditorShell
        activeDrawer={activeDrawer}
        onCloseDrawer={() => navigate('/')}
        onOpenDrawer={(path) => navigate(path)}
      />

      <VaultDrawer onClose={() => navigate('/')} open={activeDrawer === '/vault'} />
      <IncludesDrawer
        onClose={() => navigate('/')}
        open={activeDrawer === '/includes'}
      />
      <TemplatesDrawer
        onClose={() => navigate('/')}
        open={activeDrawer === '/templates'}
      />
      <SettingsDrawer
        onClose={() => navigate('/')}
        open={activeDrawer === '/settings'}
      />
    </>
  );
}
