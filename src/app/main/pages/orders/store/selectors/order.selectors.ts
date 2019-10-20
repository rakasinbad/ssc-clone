import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromOrder } from '../reducers';

export const getOrderState = createFeatureSelector<fromOrder.State>(fromOrder.FEATURE_KEY);

export const getAllOrder = createSelector(
    getOrderState,
    fromOrder.selectAllOrders
);

export const getOrderEntities = createSelector(
    getOrderState,
    fromOrder.selectOrderEntities
);

export const getTotalOrderEntity = createSelector(
    getOrderState,
    fromOrder.selectOrdersTotal
);

export const getTotalOrder = createSelector(
    getOrderState,
    state => state.orders.total
);

export const getSelectedOrderId = createSelector(
    getOrderState,
    state => state.selectedOrderId
);

export const getSelectedOrder = createSelector(
    getOrderEntities,
    getSelectedOrderId,
    (orderEntities, orderId) => orderEntities[orderId]
);
