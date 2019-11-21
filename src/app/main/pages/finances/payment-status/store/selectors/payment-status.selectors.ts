import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromPaymentStatus } from '../reducers';

export const getPaymentStatusState = createFeatureSelector<fromPaymentStatus.State>(
    fromPaymentStatus.FEATURE_KEY
);

// -----------------------------------------------------------------------------------------------------
// Payment Statuses State
// -----------------------------------------------------------------------------------------------------

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
    state => state.paymentStatuses.total
);

export const getSelectedPaymentStatusId = createSelector(
    getPaymentStatusState,
    state => state.paymentStatuses.selectedPaymentStatusId
);

export const getSelectedPaymentStatus = createSelector(
    getPaymentStatusEntities,
    getSelectedPaymentStatusId,
    (entities, id) => entities[id]
);

// -----------------------------------------------------------------------------------------------------
// Helper State
// -----------------------------------------------------------------------------------------------------

export const getIsRefresh = createSelector(getPaymentStatusState, state => state.isRefresh);

export const getIsLoading = createSelector(getPaymentStatusState, state => state.isLoading);
