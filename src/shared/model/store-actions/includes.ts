import { nanoid } from 'nanoid';
import { createNode } from '../../../entities/prompt-node/model/tree';
import type { GlobalInclude } from '../../../entities/include/model/types';
import {
  type AppStoreActions,
  type AppStoreGet,
  type AppStoreSet,
} from '../store-types';
import { withActiveDocument } from '../store-helpers';

export function createIncludeActions(
  set: AppStoreSet,
  get: AppStoreGet,
): Pick<
  AppStoreActions,
  | 'createInclude'
  | 'updateInclude'
  | 'deleteInclude'
  | 'toggleIncludeForActiveDocument'
> {
  return {
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
  };
}
