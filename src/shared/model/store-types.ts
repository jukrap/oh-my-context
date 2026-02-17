import type { GlobalInclude, WorkspaceSettings } from '../../entities/include/model/types';
import type { PromptDocument, PromptKind } from '../../entities/prompt-document/model/types';
import type { PromptNode } from '../../entities/prompt-node/model/types';

export type PreviewTab = 'XML' | 'MARKDOWN' | 'JSON';

export interface CreateDocumentPayload {
  name: string;
  kind: PromptKind;
  tags?: string[];
}

export interface AppStoreData {
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
  newlyCreatedNodeId: string | null;
}

export interface AppStoreActions {
  createDocument: (payload: CreateDocumentPayload) => void;
  deleteDocument: (id: string) => void;
  duplicateDocument: (id: string) => void;
  renameDocument: (id: string, name: string) => void;
  setActiveDocument: (id: string) => void;
  updateActiveDocument: (partial: Partial<PromptDocument>) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  setStackSearchQuery: (query: string) => void;
  setPreviewTab: (tab: PreviewTab) => void;
  setLeftPanelWidth: (width: number) => void;
  setRightPanelWidth: (width: number) => void;
  addRootNode: (tagName?: string) => void;
  addChildNode: (parentId: string, tagName?: string) => void;
  updateNode: (nodeId: string, updater: (node: PromptNode) => PromptNode) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  toggleNodeEnabled: (nodeId: string) => void;
  toggleNodeCollapsed: (nodeId: string) => void;
  moveNodeByDropTarget: (
    activeId: string,
    targetId: string,
    position: 'before' | 'inside' | 'after',
  ) => void;
  moveNodeToRootEnd: (activeId: string) => void;
  createInclude: () => void;
  updateInclude: (id: string, partial: Partial<GlobalInclude>) => void;
  deleteInclude: (id: string) => void;
  toggleIncludeForActiveDocument: (includeId: string) => void;
  updateSettings: (partial: Partial<WorkspaceSettings>) => void;
}

export interface AppStoreState extends AppStoreData, AppStoreActions {}

export type AppStoreSet = (
  partial:
    | AppStoreState
    | Partial<AppStoreState>
    | ((state: AppStoreState) => AppStoreState | Partial<AppStoreState>),
) => void;

export type AppStoreGet = () => AppStoreState;
