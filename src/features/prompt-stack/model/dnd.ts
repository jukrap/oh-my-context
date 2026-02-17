export type DropPosition = 'before' | 'inside' | 'after';

export type DropTarget = { kind: 'node'; nodeId: string; position: DropPosition };

export function buildNodeDropId(nodeId: string, position: DropPosition): string {
  return `node:${nodeId}:${position}`;
}

export function parseDropTarget(dropId: string | null): DropTarget | null {
  if (!dropId) {
    return null;
  }

  const parts = dropId.split(':');
  if (parts.length !== 3 || parts[0] !== 'node') {
    return null;
  }

  const nodeId = parts[1];
  const position = parts[2];
  if (!nodeId || !position) {
    return null;
  }

  if (position !== 'before' && position !== 'inside' && position !== 'after') {
    return null;
  }

  return {
    kind: 'node',
    nodeId,
    position,
  };
}
