import type { PromptNode } from '../../prompt-node/model/types';

export type PromptKind =
  | 'XML_STACK'
  | 'MARKDOWN_DOC'
  | 'RAW_XML'
  | 'CHAT_MESSAGES_JSON';

export interface PromptDocument {
  id: string;
  name: string;
  kind: PromptKind;
  tags: string[];
  rootTagEnabled: boolean;
  rootTagName: string;
  nodes: PromptNode[];
  globalIncludeIds: string[];
  createdAt: number;
  updatedAt: number;
  schemaVersion: number;
}
