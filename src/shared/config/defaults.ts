import { nanoid } from 'nanoid';
import type { PromptDocument, PromptKind } from '../../entities/prompt-document/model/types';
import type { WorkspaceSettings } from '../../entities/include/model/types';
import { createNode } from '../../entities/prompt-node/model/tree';

export const SCHEMA_VERSION = 1;
export const BRAND_COLOR_DEFAULT = '#00E676';

export const DEFAULT_SETTINGS: WorkspaceSettings = {
  brandColor: BRAND_COLOR_DEFAULT,
  confirmBeforeDelete: true,
  showMarkdownPreview: true,
  rawXmlStrictMode: false,
  defaultRootTagEnabled: true,
  defaultRootTagName: 'prompt',
};

export const DEFAULT_LEFT_PANEL_WIDTH = 360;
export const DEFAULT_RIGHT_PANEL_WIDTH = 420;

export function createDefaultDocument(
  name: string,
  kind: PromptKind,
): PromptDocument {
  const now = Date.now();

  return {
    id: nanoid(),
    name,
    kind,
    tags: [],
    rootTagEnabled: DEFAULT_SETTINGS.defaultRootTagEnabled,
    rootTagName: DEFAULT_SETTINGS.defaultRootTagName,
    nodes: [
      createNode({
        tagName: 'role',
        contentMode: 'Plain',
        content: 'You are a senior assistant.',
      }),
      createNode({
        tagName: 'task',
        contentMode: 'Markdown',
        content: 'Write concise and deterministic output.',
      }),
    ],
    globalIncludeIds: [],
    createdAt: now,
    updatedAt: now,
    schemaVersion: SCHEMA_VERSION,
  };
}
