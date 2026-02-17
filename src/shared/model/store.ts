import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { PromptDocument } from '../../entities/prompt-document/model/types';
import { findNodeById } from '../../entities/prompt-node/model/tree';
import type { PromptNode } from '../../entities/prompt-node/model/types';
import { DEFAULT_SETTINGS } from '../config/defaults';
import { indexedDbStateStorage } from '../lib/storage/indexeddb-storage';
import { createDocumentActions } from './store-actions/documents';
import { createIncludeActions } from './store-actions/includes';
import { createNodeActions } from './store-actions/nodes';
import { createUiActions } from './store-actions/ui';
import { getInitialState } from './store-helpers';
import type { AppStoreState } from './store-types';

export type {
  AppStoreActions,
  AppStoreData,
  AppStoreState,
  CreateDocumentPayload,
  PreviewTab,
} from './store-types';

export const useAppStore = create<AppStoreState>()(
  persist(
    (set, get) => ({
      ...getInitialState(),
      ...createDocumentActions(set, get),
      ...createNodeActions(set, get),
      ...createIncludeActions(set, get),
      ...createUiActions(set),
    }),
    {
      name: 'omc-workspace-v1',
      version: 1,
      skipHydration: true,
      storage: createJSONStorage(() => indexedDbStateStorage),
      partialize: (state) => ({
        documentsById: state.documentsById,
        documentOrder: state.documentOrder,
        activeDocumentId: state.activeDocumentId,
        includesById: state.includesById,
        includeOrder: state.includeOrder,
        settings: state.settings,
        selectedNodeId: state.selectedNodeId,
        leftPanelWidth: state.leftPanelWidth,
        rightPanelWidth: state.rightPanelWidth,
        stackSearchQuery: state.stackSearchQuery,
        previewTab: state.previewTab,
      }),
      merge: (persisted, current) => {
        const typed = (persisted as Partial<AppStoreState>) ?? {};
        const mergedSettings = {
          ...DEFAULT_SETTINGS,
          ...current.settings,
          ...(typed.settings ?? {}),
        };

        return {
          ...current,
          ...typed,
          settings: mergedSettings,
        };
      },
    },
  ),
);

export function selectActiveDocument(state: AppStoreState): PromptDocument | null {
  if (!state.activeDocumentId) {
    return null;
  }

  return state.documentsById[state.activeDocumentId] ?? null;
}

export function selectSelectedNode(state: AppStoreState): PromptNode | null {
  const document = selectActiveDocument(state);
  const nodeId = state.selectedNodeId;

  if (!document || !nodeId) {
    return null;
  }

  return findNodeById(document.nodes, nodeId);
}
