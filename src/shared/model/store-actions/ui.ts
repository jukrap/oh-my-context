import {
  type AppStoreActions,
  type AppStoreSet,
} from '../store-types';

export function createUiActions(
  set: AppStoreSet,
): Pick<
  AppStoreActions,
  | 'setStackSearchQuery'
  | 'setPreviewTab'
  | 'setLeftPanelWidth'
  | 'setRightPanelWidth'
  | 'updateSettings'
> {
  return {
    setStackSearchQuery: (query) => {
      set({ stackSearchQuery: query });
    },
    setPreviewTab: (tab) => {
      set({ previewTab: tab });
    },
    setLeftPanelWidth: (width) => {
      set({ leftPanelWidth: width });
    },
    setRightPanelWidth: (width) => {
      set({ rightPanelWidth: width });
    },
    updateSettings: (partial) => {
      set((state) => ({
        settings: {
          ...state.settings,
          ...partial,
        },
      }));
    },
  };
}
