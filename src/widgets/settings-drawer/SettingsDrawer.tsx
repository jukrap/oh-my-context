import { useAppStore } from '../../shared/model/store';
import { Drawer } from '../../shared/ui/Drawer';
import { Input } from '../../shared/ui/Input';

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);

  return (
    <Drawer onClose={onClose} open={open} title="Settings">
      <div className="drawer-group">
        <label>
          Brand Color
          <Input
            onChange={(event) => updateSettings({ brandColor: event.target.value })}
            value={settings.brandColor}
          />
        </label>
      </div>

      <div className="drawer-group">
        <label>
          <input
            checked={settings.confirmBeforeDelete}
            onChange={(event) =>
              updateSettings({ confirmBeforeDelete: event.target.checked })
            }
            type="checkbox"
          />
          Confirm before delete
        </label>
      </div>

      <div className="drawer-group">
        <label>
          <input
            checked={settings.showMarkdownPreview}
            onChange={(event) =>
              updateSettings({ showMarkdownPreview: event.target.checked })
            }
            type="checkbox"
          />
          Show markdown preview
        </label>
      </div>

      <div className="drawer-group">
        <label>
          <input
            checked={settings.rawXmlStrictMode}
            onChange={(event) =>
              updateSettings({ rawXmlStrictMode: event.target.checked })
            }
            type="checkbox"
          />
          RawXML strict mode (v1 placeholder)
        </label>
      </div>

      <div className="drawer-group">
        <label>
          <input
            checked={settings.defaultRootTagEnabled}
            onChange={(event) =>
              updateSettings({ defaultRootTagEnabled: event.target.checked })
            }
            type="checkbox"
          />
          Default root tag enabled
        </label>
      </div>

      <div className="drawer-group">
        <label>
          Default root tag name
          <Input
            onChange={(event) =>
              updateSettings({ defaultRootTagName: event.target.value })
            }
            value={settings.defaultRootTagName}
          />
        </label>
      </div>
    </Drawer>
  );
}
