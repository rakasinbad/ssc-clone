import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromOrder } from '../reducers';

export const getOrderState = createFeatureSelector<fromOrder.State>(fromOrder.FEATURE_KEY);

// -----------------------------------------------------------------------------------------------------
// Orders State
// -----------------------------------------------------------------------------------------------------

export const getAllOrder = createSelector(getOrderState, fromOrder.selectAllOrder);

export const getOrderEntities = createSelector(getOrderState, fromOrder.selectOrderEntities);

export const getTotalOrderEntity = createSelector(getOrderState, fromOrder.selectOrderTotal);

export const getTotalOrder = createSelector(getOrderState, (state) => state.orders.total);

export const getSelectedOrderId = createSelector(
    getOrderState,
    (state) => state.orders.selectedOrderId
);

export const getSelectedOrder = createSelector(
    getOrderEntities,
    getSelectedOrderId,
    (entities, id) => entities[id]
);

// -----------------------------------------------------------------------------------------------------
// Status Order State
// -----------------------------------------------------------------------------------------------------

export const getTotalStatus = createSelector(getOrderState, (state) => state.orders.totalStatus);

export const getTotalAllOrder = createSelector(getTotalStatus, (state) => state.totalOrder);
export const getTotalPendingPayment = createSelector(getTotalStatus, (state) => state.totalPendingPaymentOrder);
export const getTotalNewOrder = createSelector(getTotalStatus, (state) => state.totalNewOrder);
export const getTotalPackedOrder = createSelector(
    getTotalStatus,
    (state) => state.totalPackedOrder
);
export const getTotalShippedOrder = createSelector(
    getTotalStatus,
    (state) => state.totalShippedOrder
);
export const getTotalDeliveredOrder = createSelector(
    getTotalStatus,
    (state) => state.totalDeliveredOrder
);
export const getTotalCompletedOrder = createSelector(
    getTotalStatus,
    (state) => state.totalCompletedOrder
);
export const getTotalPendingOrder = createSelector(
    getTotalStatus,
    (state) => state.totalPendingOrder
);
export const getTotalCanceledOrder = createSelector(
    getTotalStatus,
    (state) => state.totalCanceledOrder
);

// -----------------------------------------------------------------------------------------------------
// Helper State
// -----------------------------------------------------------------------------------------------------

export const getIsRefresh = createSelector(getOrderState, (state) => state.isRefresh);

export const getIsLoading = createSelector(getOrderState, (state) => state.isLoading);
