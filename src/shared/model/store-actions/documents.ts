import { nanoid } from 'nanoid';
import {
  cloneNodesWithNewIds,
  deepCloneNodes,
} from '../../../entities/prompt-node/model/tree';
import type { PromptDocument } from '../../../entities/prompt-document/model/types';
import {
  DEFAULT_SETTINGS,
  SCHEMA_VERSION,
  createDefaultDocument,
} from '../../config/defaults';
import {
  type AppStoreActions,
  type AppStoreGet,
  type AppStoreSet,
} from '../store-types';
import { touchDocument, withActiveDocument } from '../store-helpers';

export function createDocumentActions(
  set: AppStoreSet,
  get: AppStoreGet,
): Pick<
  AppStoreActions,
  | 'createDocument'
  | 'deleteDocument'
  | 'duplicateDocument'
  | 'renameDocument'
  | 'setActiveDocument'
  | 'updateActiveDocument'
  | 'importDocumentBundle'
> {
  return {
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
        newlyCreatedNodeId: null,
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
            newlyCreatedNodeId: null,
          };
        }

        const fallbackId = nextOrder[0] ?? null;

        return {
          documentsById: remaining,
          documentOrder: nextOrder,
          activeDocumentId:
            state.activeDocumentId === id ? fallbackId : state.activeDocumentId,
          selectedNodeId: null,
          newlyCreatedNodeId:
            state.activeDocumentId === id ? null : state.newlyCreatedNodeId,
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
          newlyCreatedNodeId: null,
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
        newlyCreatedNodeId: null,
      });
    },
    importDocumentBundle: (payload) => {
      set((state) => {
        const now = Date.now();
        const includeIdMap = new Map<string, string>();
        const importedIncludeIds: string[] = [];
        const nextIncludesById = { ...state.includesById };

        (payload.includes ?? []).forEach((include) => {
          const nextIncludeId = nanoid();
          includeIdMap.set(include.id, nextIncludeId);
          importedIncludeIds.push(nextIncludeId);

          nextIncludesById[nextIncludeId] = {
            ...include,
            id: nextIncludeId,
            nodes: cloneNodesWithNewIds(deepCloneNodes(include.nodes)),
            createdAt: now,
            updatedAt: now,
          };
        });

        const remappedIncludeIds = payload.document.globalIncludeIds
          .map((includeId) => {
            const remappedId = includeIdMap.get(includeId);
            if (remappedId) {
              return remappedId;
            }

            return state.includesById[includeId] ? includeId : null;
          })
          .filter((includeId): includeId is string => includeId !== null);

        const importedDocument: PromptDocument = {
          ...payload.document,
          id: nanoid(),
          tags: [...payload.document.tags],
          globalIncludeIds: remappedIncludeIds,
          nodes: cloneNodesWithNewIds(deepCloneNodes(payload.document.nodes)),
          createdAt: now,
          updatedAt: now,
          schemaVersion: SCHEMA_VERSION,
        };

        return {
          documentsById: {
            ...state.documentsById,
            [importedDocument.id]: importedDocument,
          },
          documentOrder: [importedDocument.id, ...state.documentOrder],
          activeDocumentId: importedDocument.id,
          selectedNodeId: importedDocument.nodes[0]?.id ?? null,
          includesById: nextIncludesById,
          includeOrder: [...importedIncludeIds, ...state.includeOrder],
          settings:
            payload.applySettings && payload.settings
              ? {
                  ...DEFAULT_SETTINGS,
                  ...state.settings,
                  ...payload.settings,
                }
              : state.settings,
          newlyCreatedNodeId: null,
        };
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
  };
}
