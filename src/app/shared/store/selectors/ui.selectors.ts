import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromUi } from '../reducers';

export const getUiState = createFeatureSelector<fromUi.State>(fromUi.FEAUTURE_KEY);

export const getBreadcrumbs = createSelector(
    getUiState,
    state => state.breadcrumbs
);

export const getSmallBreadcrumbs = createSelector(
    getUiState,
    state => state.smallBreadcrumbs
);

export const getCustomToolbarActive = createSelector(
    getUiState,
    state => state.customToolbarActive
);

export const getFooterActionConfig = createSelector(
    getUiState,
    state => state.configFooterAction
);

export const getIsShowCustomToolbar = createSelector(
    getUiState,
    state => state.isShowCustomToolbar
);

export const getIsShowFooterAction = createSelector(
    getUiState,
    state => state.isShowFooterAction
);

export const getSelectedRowIndex = createSelector(
    getUiState,
    state => state.selectedRowIndex
);
