import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromUi } from '../reducers';

export const getUiState = createFeatureSelector<fromUi.State>(fromUi.FEAUTURE_KEY);

// -----------------------------------------------------------------------------------------------------
// Breadcrumbs State
// -----------------------------------------------------------------------------------------------------

export const getBreadcrumbs = createSelector(getUiState, state => state.breadcrumbs);

// -----------------------------------------------------------------------------------------------------
// Small Breadcrumbs State
// -----------------------------------------------------------------------------------------------------

export const getSmallBreadcrumbs = createSelector(getUiState, state => state.smallBreadcrumbs);

// -----------------------------------------------------------------------------------------------------
// Show Custom Toolbar State
// -----------------------------------------------------------------------------------------------------

// export const getShowCustomToolbar = createSelector(getUiState, state => state.showCustomToolbar);

// -----------------------------------------------------------------------------------------------------
// Custom Toolbar Active State
// -----------------------------------------------------------------------------------------------------

export const getCustomToolbarActive = createSelector(
    getUiState,
    state => state.customToolbarActive
);

// -----------------------------------------------------------------------------------------------------
// Is Show Custom Toolbar State
// -----------------------------------------------------------------------------------------------------

export const getIsShowCustomToolbar = createSelector(
    getUiState,
    state => state.isShowCustomToolbar
);

// -----------------------------------------------------------------------------------------------------
// Footer Action Config State
// -----------------------------------------------------------------------------------------------------

export const getFooterActionConfig = createSelector(getUiState, state => state.configFooterAction);

// -----------------------------------------------------------------------------------------------------
// Is Show Footer Action State
// -----------------------------------------------------------------------------------------------------

export const getIsShowFooterAction = createSelector(getUiState, state => state.isShowFooterAction);

// -----------------------------------------------------------------------------------------------------
// Selected Row Index State
// -----------------------------------------------------------------------------------------------------

export const getSelectedRowIndex = createSelector(getUiState, state => state.selectedRowIndex);
