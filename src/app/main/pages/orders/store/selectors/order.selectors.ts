import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromOrder } from '../reducers';

export const getOrderState = createFeatureSelector<fromOrder.State>(fromOrder.FEATURE_KEY);

// -----------------------------------------------------------------------------------------------------
// Orders State
// -----------------------------------------------------------------------------------------------------

export const getAllOrder = createSelector(getOrderState, fromOrder.selectAllOrder);

export const getOrderEntities = createSelector(getOrderState, fromOrder.selectOrderEntities);

export const getTotalOrderEntity = createSelector(getOrderState, fromOrder.selectOrderTotal);

export const getTotalOrder = createSelector(getOrderState, state => state.orders.total);

export const getSelectedOrderId = createSelector(
    getOrderState,
    state => state.orders.selectedOrderId
);

export const getSelectedOrder = createSelector(
    getOrderEntities,
    getSelectedOrderId,
    (entities, id) => entities[id]
);

// -----------------------------------------------------------------------------------------------------
// Helper State
// -----------------------------------------------------------------------------------------------------

export const getIsRefresh = createSelector(getOrderState, state => state.isRefresh);

export const getIsLoading = createSelector(getOrderState, state => state.isLoading);
