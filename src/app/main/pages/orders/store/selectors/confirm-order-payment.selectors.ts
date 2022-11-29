import { createFeatureSelector, createSelector } from '@ngrx/store';
import { fromConfirmOrderPayment } from '../reducers';

export const getConfirmOrderPayment = createFeatureSelector<fromConfirmOrderPayment.State>(
    fromConfirmOrderPayment.FEATURE_KEY
);

export const getIsLoading = createSelector(
    getConfirmOrderPayment,
    (state) => state.isLoading
);

export const getResult = createSelector(
    getConfirmOrderPayment,
    (state) => state.data
);

export const getError = createSelector(getConfirmOrderPayment, (state) => state.error);
