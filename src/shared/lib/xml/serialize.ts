import type { GlobalInclude, WorkspaceSettings } from '../../../entities/include/model/types';
import { applyIncludes } from '../../../entities/include/model/apply-includes';
import type { PromptDocument } from '../../../entities/prompt-document/model/types';
import { pruneDisabledNodes } from '../../../entities/prompt-node/model/tree';
import type { PromptNode } from '../../../entities/prompt-node/model/types';
import { isValidXmlName, validateNodeTree, type ValidationIssue } from '../../../entities/prompt-node/model/validation';

export interface XmlPreviewResult {
  xml: string;
  canExport: boolean;
  issues: ValidationIssue[];
}

const INDENT = '  ';

function escapeXmlAttribute(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function toSafeCdata(content: string): string {
  return `<![CDATA[${content.replaceAll(']]>', ']]]]><![CDATA[>')}]]>`;
}

function serializeAttributes(attributes: Record<string, string>): string {
  const entries = Object.entries(attributes);
  if (entries.length === 0) {
    return '';
  }

  return entries
    .map(([key, value]) => `${key}="${escapeXmlAttribute(value)}"`)
    .join(' ');
}

function normalizeRawXmlContent(content: string, level: number): string[] {
  if (!content.trim()) {
    return [];
  }

  return content.split('\n').map((line) => `${INDENT.repeat(level)}${line}`);
}

function serializeNode(node: PromptNode, level: number): string[] {
  const attrs = serializeAttributes(node.attributes);
  const openTag = attrs ? `<${node.tagName} ${attrs}>` : `<${node.tagName}>`;
  const closeTag = `</${node.tagName}>`;
  const nextIndent = INDENT.repeat(level);

  if (node.children.length > 0) {
    return [
      `${nextIndent}${openTag}`,
      ...node.children.flatMap((child) => serializeNode(child, level + 1)),
      `${nextIndent}${closeTag}`,
    ];
  }

  if (!node.content.trim()) {
    if (!attrs) {
      return [`${nextIndent}<${node.tagName} />`];
    }

    return [`${nextIndent}<${node.tagName} ${attrs} />`];
  }

  if (node.contentMode === 'RawXML') {
    return [
      `${nextIndent}${openTag}`,
      ...normalizeRawXmlContent(node.content, level + 1),
      `${nextIndent}${closeTag}`,
    ];
  }

  return [`${nextIndent}${openTag}${toSafeCdata(node.content)}${closeTag}`];
}

function buildXmlBody(nodes: PromptNode[]): string {
  return nodes.flatMap((node) => serializeNode(node, 0)).join('\n');
}

function validateRawXmlNodes(nodes: PromptNode[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const walk = (nodeList: PromptNode[]): void => {
    nodeList.forEach((node) => {
      if (node.contentMode === 'RawXML' && node.content.trim()) {
        const parser = new DOMParser();
        const parsed = parser.parseFromString(
          `<root>${node.content}</root>`,
          'application/xml',
        );
        const parseError = parsed.querySelector('parsererror');
        if (parseError) {
          issues.push({
            type: 'error',
            message: `Invalid RawXML content in <${node.tagName}>`,
            nodeId: node.id,
          });
        }
      }

      walk(node.children);
    });
  };

  walk(nodes);
  return issues;
}

export function buildXmlPreview(
  document: PromptDocument,
  includesById: Record<string, GlobalInclude>,
  settings: WorkspaceSettings,
): XmlPreviewResult {
  const withIncludes = applyIncludes(
    document.nodes,
    document.globalIncludeIds,
    includesById,
  );
  const enabledNodes = pruneDisabledNodes(withIncludes);
  const issues = validateNodeTree(enabledNodes);

  if (document.rootTagEnabled && !isValidXmlName(document.rootTagName)) {
    issues.push({
      type: 'error',
      message: `Invalid root tag name: "${document.rootTagName}"`,
    });
  }

  if (settings.rawXmlStrictMode) {
    issues.push(...validateRawXmlNodes(enabledNodes));
  }

  const hasError = issues.some((issue) => issue.type === 'error');
  if (hasError) {
    return {
      xml: '',
      canExport: false,
      issues,
    };
  }

  const body = buildXmlBody(enabledNodes);

  if (!document.rootTagEnabled) {
    return {
      xml: body,
      canExport: true,
      issues,
    };
  }

  const wrappedBody = body
    ? `${INDENT}${body.split('\n').join(`\n${INDENT}`)}\n`
    : '';

  return {
    xml: `<${document.rootTagName}>\n${wrappedBody}</${document.rootTagName}>`,
    canExport: true,
    issues,
  };
}
