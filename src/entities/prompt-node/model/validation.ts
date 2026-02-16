import type { PromptNode } from './types';

const XML_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_:\-.]*$/;

export interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  nodeId?: string;
}

export function isValidXmlName(value: string): boolean {
  return XML_NAME_PATTERN.test(value.trim());
}

export function validateNodeTree(nodes: PromptNode[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const walk = (nodeList: PromptNode[]): void => {
    nodeList.forEach((node) => {
      if (!isValidXmlName(node.tagName)) {
        issues.push({
          type: 'error',
          message: `Invalid tag name: "${node.tagName}"`,
          nodeId: node.id,
        });
      }

      Object.keys(node.attributes).forEach((key) => {
        if (!isValidXmlName(key)) {
          issues.push({
            type: 'error',
            message: `Invalid attribute key: "${key}"`,
            nodeId: node.id,
          });
        }
      });

      walk(node.children);
    });
  };

  walk(nodes);
  return issues;
}
