import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromForm } from '../reducers';

export const getFormState = createFeatureSelector<fromForm.State>(fromForm.FEATURE_KEY);

export const getIsClickSaveButton = createSelector(
    getFormState,
    state => state.isClickSaveButton
);

export const getIsShowSaveButton = createSelector(
    getFormState,
    state => state.isShowSaveButton
);
