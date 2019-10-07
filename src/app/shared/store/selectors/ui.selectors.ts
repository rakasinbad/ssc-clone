import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromUi } from '../reducers';

export const getUiState = createFeatureSelector<fromUi.State>(fromUi.FEAUTURE_KEY);

export const getIsShowCustomToolbar = createSelector(
    getUiState,
    state => state.isShowCustomToolbar
);
