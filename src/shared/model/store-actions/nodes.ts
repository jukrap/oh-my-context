import {
  addChildNodeInTree,
  createNode,
  duplicateNodeInTree,
  moveNodeByDrop,
  moveNodeToRootEnd,
  removeNodeFromTree,
  updateNodeInTree,
} from '../../../entities/prompt-node/model/tree';
import {
  type AppStoreActions,
  type AppStoreGet,
  type AppStoreSet,
} from '../store-types';
import { resolveNodeTagName, touchDocument, withActiveDocument } from '../store-helpers';

export function createNodeActions(
  set: AppStoreSet,
  get: AppStoreGet,
): Pick<
  AppStoreActions,
  | 'setSelectedNodeId'
  | 'addRootNode'
  | 'addChildNode'
  | 'updateNode'
  | 'deleteNode'
  | 'duplicateNode'
  | 'toggleNodeEnabled'
  | 'toggleNodeCollapsed'
  | 'moveNodeByDropTarget'
  | 'moveNodeToRootEnd'
> {
  return {
    setSelectedNodeId: (nodeId) => {
      set({
        selectedNodeId: nodeId,
        newlyCreatedNodeId: null,
      });
    },
    addRootNode: (tagName) => {
      set((state) => {
        const nextTagName = resolveNodeTagName(tagName);
        const activeId = state.activeDocumentId;
        if (!activeId) {
          return {};
        }

        const document = state.documentsById[activeId];
        if (!document) {
          return {};
        }

        const createdNode = createNode({ tagName: nextTagName });
        return {
          documentsById: {
            ...state.documentsById,
            [activeId]: touchDocument({
              ...document,
              nodes: [...document.nodes, createdNode],
            }),
          },
          newlyCreatedNodeId: createdNode.id,
        };
      });
    },
    addChildNode: (parentId, tagName) => {
      set((state) => {
        const nextTagName = resolveNodeTagName(tagName);
        const activeId = state.activeDocumentId;
        if (!activeId) {
          return {};
        }

        const document = state.documentsById[activeId];
        if (!document) {
          return {};
        }

        const createdNode = createNode({ tagName: nextTagName });
        return {
          documentsById: {
            ...state.documentsById,
            [activeId]: touchDocument({
              ...document,
              nodes: addChildNodeInTree(document.nodes, parentId, createdNode),
            }),
          },
          newlyCreatedNodeId: createdNode.id,
        };
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
          newlyCreatedNodeId:
            state.newlyCreatedNodeId === nodeId
              ? null
              : state.newlyCreatedNodeId,
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
    moveNodeByDropTarget: (activeId, targetId, position) => {
      set((state) => {
        const patched = withActiveDocument(state, (document) => ({
          ...document,
          nodes: moveNodeByDrop(document.nodes, activeId, targetId, position),
        }));
        return patched;
      });
    },
    moveNodeToRootEnd: (activeId) => {
      set((state) => {
        const patched = withActiveDocument(state, (document) => ({
          ...document,
          nodes: moveNodeToRootEnd(document.nodes, activeId),
        }));
        return patched;
      });
    },
  };
}
