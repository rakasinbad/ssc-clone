import { createFeatureSelector, createSelector } from '@ngrx/store';
import { adapterCancelOrderReason } from '../reducers/cancel-order-reason.reducer';
import { fromCancelOrderReason } from '../reducers';

export const selectState = createFeatureSelector<
    fromCancelOrderReason.State
>(fromCancelOrderReason.FEATURE_KEY);

export const getCancelOrderReasonState = createSelector(
    selectState,
    (state) => state.cancelOrderReason
);

export const { selectAll, selectEntities, selectIds, selectTotal } = adapterCancelOrderReason.getSelectors(getCancelOrderReasonState);

export const getIsLoading = createSelector(selectState, (state) => state.isLoading);

export const getIsConfirmedCancelOrder = createSelector(selectState, (state) => state.isConfirmedCancelOrder);
