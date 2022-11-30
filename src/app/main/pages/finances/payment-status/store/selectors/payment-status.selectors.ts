import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromPaymentStatus } from '../reducers';
import { getOrderState } from '../../../../orders/store/selectors/order.selectors';

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
// Status Orders by Payment State
// -----------------------------------------------------------------------------------------------------

export const getTotalStatus = createSelector(
    getPaymentStatusState,
    state => state.paymentStatuses.totalStatus
);

export const getTotalAllPayment = createSelector(getTotalStatus, state => state.totalOrder);
export const getTotalWaitingPayment = createSelector(
    getTotalStatus,
    state => state.totalWaitingForPaymentOrder
);
export const getTotalD7Payment = createSelector(getTotalStatus, state => state.totalD7PaymentOrder);
export const getTotalD3Payment = createSelector(getTotalStatus, state => state.totalD3PaymentOrder);
export const getTotalD0Payment = createSelector(getTotalStatus, state => state.totalD0PaymentOrder);
export const getTotalPaidPayment = createSelector(getTotalStatus, state => state.totalPaidOrder);
export const getTotalFailPayment = createSelector(
    getTotalStatus,
    state => state.totalPaymentFailedOrder
);
export const getTotalOverduePayment = createSelector(
    getTotalStatus,
    state => state.totalOverdueOrder
);

export const getTotalWaitingForRefund = createSelector(
    getTotalStatus,
    state => state.totalWaitingForRefund
);
export const getTotalRefunded = createSelector(
    getTotalStatus,
    state => state.totalRefunded
);


// -----------------------------------------------------------------------------------------------------
// Helper State
// -----------------------------------------------------------------------------------------------------

export const getIsRefresh = createSelector(getPaymentStatusState, state => state.isRefresh);

export const getIsLoading = createSelector(getPaymentStatusState, state => state.isLoading);



// -----------------------------------------------------------------------------------------------------
// Helper State
// -----------------------------------------------------------------------------------------------------


export const getInvoice = createSelector(getPaymentStatusState, (state) => state.invoice);
export const getInvoiceLoading = createSelector(getPaymentStatusState, (state) => state.invoiceFetching);
