import type { GlobalInclude, WorkspaceSettings } from '../../../entities/include/model/types';
import type { PromptDocument } from '../../../entities/prompt-document/model/types';

export interface JsonViewOptions {
  includeIncludes: boolean;
  includeSettings: boolean;
}

interface JsonExportShape {
  document: PromptDocument;
  includes?: GlobalInclude[];
  settings?: WorkspaceSettings;
}

export function toJsonView(
  document: PromptDocument,
  includesById: Record<string, GlobalInclude>,
  settings: WorkspaceSettings,
  options: JsonViewOptions,
): string {
  const output: JsonExportShape = { document };

  if (options.includeIncludes) {
    output.includes = document.globalIncludeIds
      .map((id) => includesById[id])
      .filter((value): value is GlobalInclude => Boolean(value));
  }

  if (options.includeSettings) {
    output.settings = settings;
  }

  return `${JSON.stringify(output, null, 2)}\n`;
}
