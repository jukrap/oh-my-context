export type ContentMode = 'Plain' | 'Markdown' | 'RawXML';

export interface PromptNode {
  id: string;
  tagName: string;
  attributes: Record<string, string>;
  contentMode: ContentMode;
  content: string;
  children: PromptNode[];
  enabled: boolean;
  collapsed: boolean;
}
