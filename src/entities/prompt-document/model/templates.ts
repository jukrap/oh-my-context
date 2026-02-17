import type { PromptNode } from '../../prompt-node/model/types';
import { createNode } from '../../prompt-node/model/tree';
import type { ContentMode } from '../../prompt-node/model/types';
import type { PromptKind } from './types';

export type PromptTemplateId =
  | 'XML_BASELINE'
  | 'XML_STRICT_OUTPUT'
  | 'RAW_XML_FRAGMENT'
  | 'CHAT_MESSAGES_STARTER';

interface TemplateNodeSeed {
  tagName: string;
  contentMode: ContentMode;
  content: string;
  attributes?: Record<string, string>;
  children?: TemplateNodeSeed[];
}

export interface PromptTemplate {
  id: PromptTemplateId;
  kind: PromptKind;
  suggestedName: string;
  tags: string[];
  rootTagEnabled: boolean;
  rootTagName: string;
  nodes: PromptNode[];
}

const TEMPLATE_IDS: PromptTemplateId[] = [
  'XML_BASELINE',
  'XML_STRICT_OUTPUT',
  'RAW_XML_FRAGMENT',
  'CHAT_MESSAGES_STARTER',
];

function toNode(seed: TemplateNodeSeed): PromptNode {
  return createNode({
    tagName: seed.tagName,
    contentMode: seed.contentMode,
    content: seed.content,
    attributes: seed.attributes ?? {},
    children: (seed.children ?? []).map(toNode),
  });
}

function toNodes(seeds: TemplateNodeSeed[]): PromptNode[] {
  return seeds.map(toNode);
}

function buildTemplate(templateId: PromptTemplateId): PromptTemplate {
  switch (templateId) {
    case 'XML_BASELINE':
      return {
        id: templateId,
        kind: 'XML_STACK',
        suggestedName: 'XML Baseline Prompt',
        tags: ['xml', 'baseline'],
        rootTagEnabled: true,
        rootTagName: 'prompt',
        nodes: toNodes([
          {
            tagName: 'role',
            contentMode: 'Plain',
            content: 'You are a precise assistant.',
          },
          {
            tagName: 'task',
            contentMode: 'Markdown',
            content:
              'Complete the user request exactly.\n- Keep output concise.\n- Avoid extra assumptions.',
          },
          {
            tagName: 'context',
            contentMode: 'Plain',
            content: 'Relevant background information goes here.',
          },
          {
            tagName: 'constraints',
            contentMode: 'Markdown',
            content: '- Follow required format.\n- Do not include forbidden content.',
          },
          {
            tagName: 'output_format',
            contentMode: 'Plain',
            content: 'Return a clear final answer.',
          },
        ]),
      };
    case 'XML_STRICT_OUTPUT':
      return {
        id: templateId,
        kind: 'XML_STACK',
        suggestedName: 'XML Strict Output Prompt',
        tags: ['xml', 'structured-output'],
        rootTagEnabled: true,
        rootTagName: 'prompt',
        nodes: toNodes([
          {
            tagName: 'role',
            contentMode: 'Plain',
            content: 'You are a strict formatter.',
          },
          {
            tagName: 'objective',
            contentMode: 'Plain',
            content: 'Solve the request and produce schema-compliant output.',
          },
          {
            tagName: 'format_rules',
            contentMode: 'Markdown',
            content:
              '- Use exactly the requested keys.\n- Keep key order stable.\n- No prose outside the format.',
          },
          {
            tagName: 'output_schema',
            contentMode: 'RawXML',
            content:
              '<schema>\n  <field name="result" type="string" />\n  <field name="confidence" type="number" />\n</schema>',
          },
        ]),
      };
    case 'RAW_XML_FRAGMENT':
      return {
        id: templateId,
        kind: 'RAW_XML',
        suggestedName: 'Raw XML Fragment Prompt',
        tags: ['raw-xml', 'fragment'],
        rootTagEnabled: true,
        rootTagName: 'prompt',
        nodes: toNodes([
          {
            tagName: 'instructions',
            contentMode: 'Plain',
            content: 'Inject the fragment below into downstream XML pipeline.',
          },
          {
            tagName: 'fragment',
            contentMode: 'RawXML',
            content:
              '<rules>\n  <rule id="r1">Be deterministic.</rule>\n  <rule id="r2">No hidden steps.</rule>\n</rules>',
          },
        ]),
      };
    case 'CHAT_MESSAGES_STARTER':
      return {
        id: templateId,
        kind: 'CHAT_MESSAGES_JSON',
        suggestedName: 'Chat Messages Starter',
        tags: ['chat', 'messages-json'],
        rootTagEnabled: false,
        rootTagName: 'prompt',
        nodes: toNodes([
          {
            tagName: 'system',
            contentMode: 'Plain',
            content: 'You are a helpful assistant.',
          },
          {
            tagName: 'user',
            contentMode: 'Plain',
            content: 'Summarize the following text in 3 bullets.',
          },
          {
            tagName: 'assistant_format',
            contentMode: 'Markdown',
            content: '- bullet 1\n- bullet 2\n- bullet 3',
          },
        ]),
      };
  }
}

export function getPromptTemplateIds(): PromptTemplateId[] {
  return TEMPLATE_IDS;
}

export function createPromptTemplate(templateId: PromptTemplateId): PromptTemplate {
  return buildTemplate(templateId);
}
