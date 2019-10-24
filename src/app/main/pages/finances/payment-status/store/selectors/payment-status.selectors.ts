import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromPaymentStatus } from '../reducers';

export const getPaymentStatusState = createFeatureSelector<fromPaymentStatus.State>(
    fromPaymentStatus.FEATURE_KEY
);

export const getAllPaymentStatus = createSelector(
    getPaymentStatusState,
    fromPaymentStatus.selectAllPaymentStatus
);

export const getPaymentStatusEntities = createSelector(
    getPaymentStatusState,
    fromPaymentStatus.selectPaymentStatusEntities
);

export const getTotalPaymentStatusEntity = createSelector(
    getPaymentStatusState,
    fromPaymentStatus.selectPaymentStatusTotal
);

export const getTotalPaymentStatus = createSelector(
    getPaymentStatusState,
    state => state.paymentStatus.total
);

export const getSelectedPaymentStatusId = createSelector(
    getPaymentStatusState,
    state => state.selectedPaymentStatusId
);

export const getSelectedPaymentStatus = createSelector(
    getPaymentStatusEntities,
    getSelectedPaymentStatusId,
    (paymentStatusEntities, paymentStatusId) => paymentStatusEntities[paymentStatusId]
);
