import { Drawer } from '../../shared/ui/Drawer';

interface TemplatesDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function TemplatesDrawer({ open, onClose }: TemplatesDrawerProps) {
  return (
    <Drawer onClose={onClose} open={open} title="Templates (v1)">
      <div className="drawer-group">
        <p>Template presets will be added in v1.</p>
        <p>Current MVP focuses on vault, stack editing, includes and export safety.</p>
      </div>
    </Drawer>
  );
}
