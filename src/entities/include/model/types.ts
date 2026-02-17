import type { PromptNode } from '../../prompt-node/model/types';

export type InsertionPosition =
  | 'TOP'
  | 'BOTTOM'
  | 'BEFORE_TAG'
  | 'AFTER_TAG'
  | 'INSIDE_TAG';

export interface InsertionRule {
  position: InsertionPosition;
  targetTagName: string;
}

export interface GlobalInclude {
  id: string;
  name: string;
  description: string;
  nodes: PromptNode[];
  insertion: InsertionRule;
  enabledByDefault: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface WorkspaceSettings {
  language: 'en' | 'ko';
  brandColor: string;
  confirmBeforeDelete: boolean;
  showMarkdownPreview: boolean;
  rawXmlStrictMode: boolean;
  defaultRootTagEnabled: boolean;
  defaultRootTagName: string;
}
