import { contextSrv } from '../../../core/services/context_srv';
import { DashboardSection, DashboardSectionItem, ManageDashboardState, SectionsState } from 'app/types';
import { Action, ActionTypes } from './actions';

export const initialManageDashboardState: ManageDashboardState = {
  manageDashboard: {
    selectAllChecked: false,
    canMove: false,
    canDelete: false,
    canSave: false,
    hasFilters: false,
    folderId: 0,
    folderUid: '',
    hasEditPermissionInFolders: contextSrv.hasEditPermissionInFolders,
    isEditor: contextSrv.isEditor,
    filterOnStarred: false,
    selectedTagFilter: '',
  },
  dashboardQuery: {
    query: '',
    mode: 'tree',
    tag: [],
    starred: false,
    skipRecent: true,
    skipStarred: true,
    folderIds: [],
  },
};

const initialSectionsState: SectionsState = {
  sections: [] as DashboardSection[],
  allChecked: false,
  dashboardTags: [],
};

export const manageDashboardsReducer = (state = initialManageDashboardState, action: Action): ManageDashboardState => {
  switch (action.type) {
    case ActionTypes.SetDashboardSearchQuery:
      return { ...state, dashboardQuery: { ...state.dashboardQuery, query: action.payload } };

    case ActionTypes.RemoveTag:
      const tag = state.dashboardQuery.tag.filter(tag => tag !== action.payload);

      return {
        ...state,
        dashboardQuery: { ...state.dashboardQuery, tag: tag },
      };

    case ActionTypes.ClearFilters:
      return {
        ...state,
        dashboardQuery: { ...state.dashboardQuery, tag: [], starred: false, query: '' },
      };

    case ActionTypes.AddTagFilter:
      const tags = state.dashboardQuery.tag;

      if (tags.indexOf(action.payload) === -1) {
        tags.push(action.payload);
      }

      return { ...state, dashboardQuery: { ...state.dashboardQuery, tag: tags } };

    case ActionTypes.SetStarredFilter:
      return { ...state, dashboardQuery: { ...state.dashboardQuery, starred: action.payload } };
  }

  return state;
};

export const sectionsReducer = (state = initialSectionsState, action: Action): SectionsState => {
  let newSections = [] as DashboardSection[];
  let newItems = [] as DashboardSectionItem[];

  switch (action.type) {
    case ActionTypes.LoadSections:
      return { ...state, sections: action.payload };

    case ActionTypes.LoadSectionItems:
      const items = action.payload.items.map(item => {
        return { ...item, checked: false };
      });

      newSections = state.sections.map(section => {
        if (section.id === action.payload.id) {
          return { ...section, expanded: true, items: items };
        }

        return section;
      });

      return { ...state, sections: newSections };

    case ActionTypes.CollapseSection:
      newSections = state.sections.map(section => {
        if (section.id === action.payload) {
          return { ...section, expanded: false, items: [] };
        }

        return section;
      });

      return { ...state, sections: newSections };

    case ActionTypes.SetSectionItemSelected:
      newSections = state.sections.map(section => {
        if (section.id === action.payload.folderId) {
          newItems = section.items.map(item => {
            if (item.id === action.payload.itemId) {
              return { ...item, checked: action.payload.state };
            }

            return item;
          });

          return { ...section, items: newItems };
        }

        return section;
      });

      return { ...state, sections: newSections };

    case ActionTypes.SetSectionSelected:
      newSections = state.sections.map(section => {
        if (section.id === action.payload) {
          return { ...section, checked: !section.checked };
        }
        return section;
      });

      return { ...state, sections: newSections };

    case ActionTypes.SetAllSectionsAndItemsSelected:
      newSections = state.sections.map(section => {
        newItems = section.items.map(item => {
          return { ...item, checked: action.payload };
        });

        return { ...section, checked: action.payload, items: newItems };
      });

      return { ...state, sections: newSections, allChecked: action.payload };

    case ActionTypes.LoadDashboardTags:
      return { ...state, dashboardTags: action.payload };
  }

  return state;
};

export default {
  manageDashboards: manageDashboardsReducer,
  sections: sectionsReducer,
};
