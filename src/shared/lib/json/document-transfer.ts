import type {
  GlobalInclude,
  InsertionPosition,
  WorkspaceSettings,
} from '../../../entities/include/model/types';
import type {
  PromptDocument,
  PromptKind,
} from '../../../entities/prompt-document/model/types';
import type {
  ContentMode,
  PromptNode,
} from '../../../entities/prompt-node/model/types';

const TRANSFER_VERSION = 1;

const PROMPT_KINDS: PromptKind[] = [
  'XML_STACK',
  'MARKDOWN_DOC',
  'RAW_XML',
  'CHAT_MESSAGES_JSON',
];

const CONTENT_MODES: ContentMode[] = ['Plain', 'Markdown', 'RawXML'];
const INSERTION_POSITIONS: InsertionPosition[] = [
  'TOP',
  'BOTTOM',
  'BEFORE_TAG',
  'AFTER_TAG',
  'INSIDE_TAG',
];

export interface DocumentTransferBundle {
  version: number;
  exportedAt: number;
  document: PromptDocument;
  includes?: GlobalInclude[];
  settings?: WorkspaceSettings;
}

export interface DocumentTransferOptions {
  includeIncludes: boolean;
  includeSettings: boolean;
}

type ParseResult =
  | { ok: true; bundle: DocumentTransferBundle }
  | { ok: false; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isStringRecord(value: unknown): value is Record<string, string> {
  if (!isRecord(value)) {
    return false;
  }

  return Object.values(value).every((item) => typeof item === 'string');
}

function isPromptKind(value: unknown): value is PromptKind {
  return typeof value === 'string' && PROMPT_KINDS.includes(value as PromptKind);
}

function isContentMode(value: unknown): value is ContentMode {
  return typeof value === 'string' && CONTENT_MODES.includes(value as ContentMode);
}

function isPromptNode(value: unknown): value is PromptNode {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.tagName === 'string' &&
    isStringRecord(value.attributes) &&
    isContentMode(value.contentMode) &&
    typeof value.content === 'string' &&
    Array.isArray(value.children) &&
    value.children.every((child) => isPromptNode(child)) &&
    typeof value.enabled === 'boolean' &&
    typeof value.collapsed === 'boolean'
  );
}

function isPromptDocument(value: unknown): value is PromptDocument {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    isPromptKind(value.kind) &&
    isStringArray(value.tags) &&
    typeof value.rootTagEnabled === 'boolean' &&
    typeof value.rootTagName === 'string' &&
    Array.isArray(value.nodes) &&
    value.nodes.every((node) => isPromptNode(node)) &&
    isStringArray(value.globalIncludeIds) &&
    typeof value.createdAt === 'number' &&
    typeof value.updatedAt === 'number' &&
    typeof value.schemaVersion === 'number'
  );
}

function isInsertionPosition(value: unknown): value is InsertionPosition {
  return (
    typeof value === 'string' &&
    INSERTION_POSITIONS.includes(value as InsertionPosition)
  );
}

function isGlobalInclude(value: unknown): value is GlobalInclude {
  if (!isRecord(value) || !isRecord(value.insertion)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.description === 'string' &&
    Array.isArray(value.nodes) &&
    value.nodes.every((node) => isPromptNode(node)) &&
    isInsertionPosition(value.insertion.position) &&
    typeof value.insertion.targetTagName === 'string' &&
    typeof value.enabledByDefault === 'boolean' &&
    typeof value.createdAt === 'number' &&
    typeof value.updatedAt === 'number'
  );
}

function isWorkspaceSettings(value: unknown): value is WorkspaceSettings {
  if (!isRecord(value)) {
    return false;
  }

  return (
    (value.language === 'en' || value.language === 'ko') &&
    typeof value.confirmBeforeDelete === 'boolean' &&
    typeof value.showMarkdownPreview === 'boolean' &&
    typeof value.rawXmlStrictMode === 'boolean' &&
    typeof value.defaultRootTagEnabled === 'boolean' &&
    typeof value.defaultRootTagName === 'string'
  );
}

export function createDocumentTransferBundle(
  document: PromptDocument,
  includesById: Record<string, GlobalInclude>,
  settings: WorkspaceSettings,
  options: DocumentTransferOptions,
): DocumentTransferBundle {
  const bundle: DocumentTransferBundle = {
    version: TRANSFER_VERSION,
    exportedAt: Date.now(),
    document,
  };

  if (options.includeIncludes) {
    bundle.includes = document.globalIncludeIds
      .map((includeId) => includesById[includeId])
      .filter((include): include is GlobalInclude => Boolean(include));
  }

  if (options.includeSettings) {
    bundle.settings = settings;
  }

  return bundle;
}

export function parseDocumentTransferBundle(raw: string): ParseResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, message: 'invalid_json' };
  }

  if (!isRecord(parsed) || !isPromptDocument(parsed.document)) {
    return { ok: false, message: 'invalid_document' };
  }

  let typedIncludes: GlobalInclude[] | undefined;
  if (typeof parsed.includes !== 'undefined') {
    if (
      !Array.isArray(parsed.includes) ||
      !parsed.includes.every((include) => isGlobalInclude(include))
    ) {
      return { ok: false, message: 'invalid_includes' };
    }
    typedIncludes = parsed.includes;
  }

  let typedSettings: WorkspaceSettings | undefined;
  if (typeof parsed.settings !== 'undefined') {
    if (!isWorkspaceSettings(parsed.settings)) {
      return { ok: false, message: 'invalid_settings' };
    }
    typedSettings = parsed.settings;
  }

  const version =
    typeof parsed.version === 'number' && Number.isFinite(parsed.version)
      ? parsed.version
      : TRANSFER_VERSION;
  const exportedAt =
    typeof parsed.exportedAt === 'number' && Number.isFinite(parsed.exportedAt)
      ? parsed.exportedAt
      : Date.now();

  return {
    ok: true,
    bundle: {
      version,
      exportedAt,
      document: parsed.document,
      includes: typedIncludes,
      settings: typedSettings,
    },
  };
}
