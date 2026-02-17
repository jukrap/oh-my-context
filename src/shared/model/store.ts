import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { GlobalInclude, WorkspaceSettings } from '../../entities/include/model/types';
import type { PromptDocument, PromptKind } from '../../entities/prompt-document/model/types';
import { createNode, addChildNodeInTree, duplicateNodeInTree, findNodeById, removeNodeFromTree, reorderNodesWithinParent, updateNodeInTree } from '../../entities/prompt-node/model/tree';
import type { PromptNode } from '../../entities/prompt-node/model/types';
import { DEFAULT_LEFT_PANEL_WIDTH, DEFAULT_RIGHT_PANEL_WIDTH, DEFAULT_SETTINGS, SCHEMA_VERSION, createDefaultDocument, createInitialSettings } from '../config/defaults';
import { indexedDbStateStorage } from '../lib/storage/indexeddb-storage';

export type PreviewTab = 'XML' | 'MARKDOWN' | 'JSON';

interface CreateDocumentPayload {
  name: string;
  kind: PromptKind;
  tags?: string[];
}

interface AppStoreState {
  documentsById: Record<string, PromptDocument>;
  documentOrder: string[];
  activeDocumentId: string | null;
  includesById: Record<string, GlobalInclude>;
  includeOrder: string[];
  settings: WorkspaceSettings;
  selectedNodeId: string | null;
  leftPanelWidth: number;
  rightPanelWidth: number;
  stackSearchQuery: string;
  previewTab: PreviewTab;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt: number | null;
  hydrated: boolean;
  createDocument: (payload: CreateDocumentPayload) => void;
  deleteDocument: (id: string) => void;
  duplicateDocument: (id: string) => void;
  renameDocument: (id: string, name: string) => void;
  setActiveDocument: (id: string) => void;
  updateActiveDocument: (partial: Partial<PromptDocument>) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  setStackSearchQuery: (query: string) => void;
  setPreviewTab: (tab: PreviewTab) => void;
  setSaveStatus: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
  setHydrated: (value: boolean) => void;
  setLeftPanelWidth: (width: number) => void;
  setRightPanelWidth: (width: number) => void;
  addRootNode: () => void;
  addChildNode: (parentId: string) => void;
  updateNode: (nodeId: string, updater: (node: PromptNode) => PromptNode) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  toggleNodeEnabled: (nodeId: string) => void;
  toggleNodeCollapsed: (nodeId: string) => void;
  moveNodeWithinParent: (activeId: string, overId: string) => void;
  createInclude: () => void;
  updateInclude: (id: string, partial: Partial<GlobalInclude>) => void;
  deleteInclude: (id: string) => void;
  toggleIncludeForActiveDocument: (includeId: string) => void;
  updateSettings: (partial: Partial<WorkspaceSettings>) => void;
}

const initialDocument = createDefaultDocument('Untitled Prompt', 'XML_STACK');

function touchDocument(document: PromptDocument): PromptDocument {
  return {
    ...document,
    updatedAt: Date.now(),
  };
}

function withActiveDocument(
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

function getInitialState(): Omit<
  AppStoreState,
  | 'createDocument'
  | 'deleteDocument'
  | 'duplicateDocument'
  | 'renameDocument'
  | 'setActiveDocument'
  | 'updateActiveDocument'
  | 'setSelectedNodeId'
  | 'setStackSearchQuery'
  | 'setPreviewTab'
  | 'setSaveStatus'
  | 'setHydrated'
  | 'setLeftPanelWidth'
  | 'setRightPanelWidth'
  | 'addRootNode'
  | 'addChildNode'
  | 'updateNode'
  | 'deleteNode'
  | 'duplicateNode'
  | 'toggleNodeEnabled'
  | 'toggleNodeCollapsed'
  | 'moveNodeWithinParent'
  | 'createInclude'
  | 'updateInclude'
  | 'deleteInclude'
  | 'toggleIncludeForActiveDocument'
  | 'updateSettings'
> {
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
    saveStatus: 'idle',
    lastSavedAt: null,
    hydrated: false,
  };
}

export const useAppStore = create<AppStoreState>()(
  persist(
    (set, get) => ({
      ...getInitialState(),
      createDocument: (payload) => {
        const document = createDefaultDocument(payload.name, payload.kind);
        document.tags = payload.tags ?? [];

        set((state) => ({
          documentsById: {
            ...state.documentsById,
            [document.id]: document,
          },
          documentOrder: [document.id, ...state.documentOrder],
          activeDocumentId: document.id,
          selectedNodeId: null,
        }));
      },
      deleteDocument: (id) => {
        set((state) => {
          const remaining = { ...state.documentsById };
          delete remaining[id];
          const nextOrder = state.documentOrder.filter((docId) => docId !== id);
          if (nextOrder.length === 0) {
            const fallback = createDefaultDocument('Untitled Prompt', 'XML_STACK');
            return {
              documentsById: { [fallback.id]: fallback },
              documentOrder: [fallback.id],
              activeDocumentId: fallback.id,
              selectedNodeId: null,
            };
          }

          const fallbackId = nextOrder[0] ?? null;

          return {
            documentsById: remaining,
            documentOrder: nextOrder,
            activeDocumentId:
              state.activeDocumentId === id ? fallbackId : state.activeDocumentId,
            selectedNodeId: null,
          };
        });
      },
      duplicateDocument: (id) => {
        set((state) => {
          const source = state.documentsById[id];
          if (!source) {
            return {};
          }

          const now = Date.now();
          const duplicateId = nanoid();
          const duplicateSuffix = state.settings.language === 'ko' ? '복사본' : 'Copy';
          const duplicate: PromptDocument = {
            ...source,
            id: duplicateId,
            name: `${source.name} ${duplicateSuffix}`,
            createdAt: now,
            updatedAt: now,
            schemaVersion: SCHEMA_VERSION,
            nodes: source.nodes.map((node) => ({
              ...node,
              attributes: { ...node.attributes },
              children: structuredClone(node.children),
            })),
          };

          return {
            documentsById: {
              ...state.documentsById,
              [duplicate.id]: duplicate,
            },
            documentOrder: [duplicate.id, ...state.documentOrder],
            activeDocumentId: duplicate.id,
            selectedNodeId: null,
          };
        });
      },
      renameDocument: (id, name) => {
        set((state) => {
          const document = state.documentsById[id];
          if (!document) {
            return {};
          }

          return {
            documentsById: {
              ...state.documentsById,
              [id]: touchDocument({
                ...document,
                name,
              }),
            },
          };
        });
      },
      setActiveDocument: (id) => {
        const state = get();
        if (!state.documentsById[id]) {
          return;
        }

        set({
          activeDocumentId: id,
          selectedNodeId: null,
        });
      },
      updateActiveDocument: (partial) => {
        set((state) => {
          const patched = withActiveDocument(state, (document) => ({
            ...document,
            ...partial,
          }));
          return patched;
        });
      },
      setSelectedNodeId: (nodeId) => {
        set({ selectedNodeId: nodeId });
      },
      setStackSearchQuery: (query) => {
        set({ stackSearchQuery: query });
      },
      setPreviewTab: (tab) => {
        set({ previewTab: tab });
      },
      setSaveStatus: (status) => {
        set({
          saveStatus: status,
          lastSavedAt: status === 'saved' ? Date.now() : get().lastSavedAt,
        });
      },
      setHydrated: (value) => {
        set({ hydrated: value });
      },
      setLeftPanelWidth: (width) => {
        set({ leftPanelWidth: width });
      },
      setRightPanelWidth: (width) => {
        set({ rightPanelWidth: width });
      },
      addRootNode: () => {
        set((state) => {
          const patched = withActiveDocument(state, (document) => ({
            ...document,
            nodes: [...document.nodes, createNode()],
          }));
          return patched;
        });
      },
      addChildNode: (parentId) => {
        set((state) => {
          const patched = withActiveDocument(state, (document) => ({
            ...document,
            nodes: addChildNodeInTree(document.nodes, parentId, createNode()),
          }));
          return patched;
        });
      },
      updateNode: (nodeId, updater) => {
        set((state) => {
          const patched = withActiveDocument(state, (document) => ({
            ...document,
            nodes: updateNodeInTree(document.nodes, nodeId, updater),
          }));
          return patched;
        });
      },
      deleteNode: (nodeId) => {
        set((state) => {
          const patched = withActiveDocument(state, (document) => ({
            ...document,
            nodes: removeNodeFromTree(document.nodes, nodeId),
          }));
          return {
            ...patched,
            selectedNodeId:
              state.selectedNodeId === nodeId ? null : state.selectedNodeId,
          };
        });
      },
      duplicateNode: (nodeId) => {
        set((state) => {
          const patched = withActiveDocument(state, (document) => ({
            ...document,
            nodes: duplicateNodeInTree(document.nodes, nodeId),
          }));
          return patched;
        });
      },
      toggleNodeEnabled: (nodeId) => {
        get().updateNode(nodeId, (node) => ({
          ...node,
          enabled: !node.enabled,
        }));
      },
      toggleNodeCollapsed: (nodeId) => {
        get().updateNode(nodeId, (node) => ({
          ...node,
          collapsed: !node.collapsed,
        }));
      },
      moveNodeWithinParent: (activeId, overId) => {
        set((state) => {
          const patched = withActiveDocument(state, (document) => ({
            ...document,
            nodes: reorderNodesWithinParent(document.nodes, activeId, overId),
          }));
          return patched;
        });
      },
      createInclude: () => {
        const now = Date.now();
        const id = nanoid();
        const name = get().settings.language === 'ko' ? '새 Include' : 'New Include';
        const include: GlobalInclude = {
          id,
          name,
          description: '',
          nodes: [
            createNode({
              tagName: 'guideline',
              contentMode: 'Plain',
              content: 'Always answer concisely.',
            }),
          ],
          insertion: {
            position: 'TOP',
            targetTagName: '',
          },
          enabledByDefault: true,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          includesById: {
            ...state.includesById,
            [include.id]: include,
          },
          includeOrder: [include.id, ...state.includeOrder],
        }));
      },
      updateInclude: (id, partial) => {
        set((state) => {
          const existing = state.includesById[id];
          if (!existing) {
            return {};
          }

          return {
            includesById: {
              ...state.includesById,
              [id]: {
                ...existing,
                ...partial,
                updatedAt: Date.now(),
              },
            },
          };
        });
      },
      deleteInclude: (id) => {
        set((state) => {
          const remaining = { ...state.includesById };
          delete remaining[id];
          const nextOrder = state.includeOrder.filter((includeId) => includeId !== id);

          const nextDocuments = Object.fromEntries(
            Object.entries(state.documentsById).map(([docId, document]) => [
              docId,
              {
                ...document,
                globalIncludeIds: document.globalIncludeIds.filter(
                  (includeId) => includeId !== id,
                ),
              },
            ]),
          );

          return {
            includesById: remaining,
            includeOrder: nextOrder,
            documentsById: nextDocuments,
          };
        });
      },
      toggleIncludeForActiveDocument: (includeId) => {
        set((state) => {
          const patched = withActiveDocument(state, (document) => {
            const exists = document.globalIncludeIds.includes(includeId);
            return {
              ...document,
              globalIncludeIds: exists
                ? document.globalIncludeIds.filter((id) => id !== includeId)
                : [...document.globalIncludeIds, includeId],
            };
          });
          return patched;
        });
      },
      updateSettings: (partial) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ...partial,
          },
        }));
      },
    }),
    {
      name: 'omc-workspace-v1',
      version: 1,
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
          saveStatus: 'idle',
          lastSavedAt: null,
          hydrated: false,
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
