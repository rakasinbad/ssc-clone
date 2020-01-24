import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromForm } from '../reducers';

export const getFormState = createFeatureSelector<fromForm.State>(fromForm.FEATURE_KEY);

export const getIsClickCancelButton = createSelector(
    getFormState,
    state => state.isClickCancelButton
);

export const getIsClickSaveButton = createSelector(getFormState, state => state.isClickSaveButton);

export const getIsShowSaveButton = createSelector(getFormState, state => state.isShowSaveButton);

export const getIsClickResetButton = createSelector(
    getFormState,
    state => state.isClickResetButton
);

export const getStatusForm = createSelector(getFormState, state => state.status);

export const getCancelButtonAction = createSelector(
    getFormState,
    state => state.cancelButtonAction
);

export const getIsValidForm = createSelector(getFormState, state => state.status === 'VALID');

export const getIsInvalidForm = createSelector(getFormState, state => state.status === 'INVALID');
