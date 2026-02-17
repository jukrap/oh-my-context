import type { PromptDocument } from '../../entities/prompt-document/model/types';
import { isValidXmlName } from '../../entities/prompt-node/model/validation';
import {
  DEFAULT_LEFT_PANEL_WIDTH,
  DEFAULT_RIGHT_PANEL_WIDTH,
  createDefaultDocument,
  createInitialSettings,
} from '../config/defaults';
import type { AppStoreData, AppStoreState } from './store-types';

const initialDocument = createDefaultDocument('Untitled Prompt', 'XML_STACK');

export function touchDocument(document: PromptDocument): PromptDocument {
  return {
    ...document,
    updatedAt: Date.now(),
  };
}

export function resolveNodeTagName(tagName?: string): string {
  if (!tagName) {
    return 'context';
  }

  const candidate = tagName.trim();
  return isValidXmlName(candidate) ? candidate : 'context';
}

export function withActiveDocument(
  state: AppStoreState,
  updater: (document: PromptDocument) => PromptDocument,
): Pick<AppStoreState, 'documentsById'> {
  const activeId = state.activeDocumentId;
  if (!activeId) {
    return { documentsById: state.documentsById };
  }

  const current = state.documentsById[activeId];
  if (!current) {
    return { documentsById: state.documentsById };
  }

  return {
    documentsById: {
      ...state.documentsById,
      [activeId]: touchDocument(updater(current)),
    },
  };
}

export function getInitialState(): AppStoreData {
  return {
    documentsById: {
      [initialDocument.id]: initialDocument,
    },
    documentOrder: [initialDocument.id],
    activeDocumentId: initialDocument.id,
    includesById: {},
    includeOrder: [],
    settings: createInitialSettings(),
    selectedNodeId: null,
    leftPanelWidth: DEFAULT_LEFT_PANEL_WIDTH,
    rightPanelWidth: DEFAULT_RIGHT_PANEL_WIDTH,
    stackSearchQuery: '',
    previewTab: 'XML',
    newlyCreatedNodeId: null,
  };
}
