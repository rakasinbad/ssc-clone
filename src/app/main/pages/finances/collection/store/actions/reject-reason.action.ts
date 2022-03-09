import { createAction, props } from '@ngrx/store';
import { ErrorHandler, EStatus } from 'app/shared/models/global.model';
import { Update } from '@ngrx/entity';
import { ColPaymentApproval, PaymApproval, PaymColReject, ColPaymentReject, CollectionStatus, PaymColApprove } from '../../models';
import { IAPIOptions } from '../../services/approve-reject.service';

// -----------------------------------------------------------------------------------------------------
// Collection
// -----------------------------------------------------------------------------------------------------

// -----------------------------------------------------------------------------------------------------
// Fetch Reject Reason List
// -----------------------------------------------------------------------------------------------------

export const fetchRejectReasonRequest = createAction(
    '[Collection API] Fetch Reject Reason Request',
    props<{ payload: { type: string } }>()
);

export const fetchRejectReasonFailure = createAction(
    '[Collection API] Fetch Reject Reason Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchRejectReasonSuccess = createAction(
    '[Collection API] Fetch Reject Reason Success',
    props<{ payload: { data: ColPaymentApproval[] } }>()
);

// -----------------------------------------------------------------------------------------------------
// Update Collection Payment Approval
// -----------------------------------------------------------------------------------------------------

export const updateColPaymentApprovalRequest = createAction(
    '[Collection API] Update Collection Payment Approval Request',
    props<{ payload: { body: PaymColApprove; id: number } }>()
);

export const updateColPaymentApprovalFailure = createAction(
    '[Collection API] Update Collection Payment Approval Failure',
    props<{ payload: ErrorHandler }>()
);

export const updateColPaymentApprovalSuccess = createAction(
    '[Collection API] Update Collection Payment Approval Success',
    props<{ payload: Update<CollectionStatus> }>()
);

// -----------------------------------------------------------------------------------------------------
// Update Collection Payment Reject
// -----------------------------------------------------------------------------------------------------

export const updateColPaymentRejectRequest = createAction(
    '[Collection API] Update Collection Payment Reject Request',
    props<{ payload: { body: PaymColReject; id: number } }>()
);

export const updateColPaymentRejectFailure = createAction(
    '[Collection API] Update Collection Payment Reject Failure',
    props<{ payload: ErrorHandler }>()
);

export const updateColPaymentRejectSuccess = createAction(
    '[Collection API] Update Collection Payment Reject Success',
    props<{ payload: Update<CollectionStatus> }>()
);

// -----------------------------------------------------------------------------------------------------
// Billing
// -----------------------------------------------------------------------------------------------------

// -----------------------------------------------------------------------------------------------------
// Update Billing Payment Approval
// -----------------------------------------------------------------------------------------------------

export const updateBillingPaymentApprovalRequest = createAction(
    '[Billing API] Update Billing Payment Approval Request',
    props<{ payload: { body: PaymApproval; id: number} }>()
);

export const updateBillingPaymentApprovalFailure = createAction(
    '[Billing API] Update Billing Payment Approval Failure',
    props<{ payload: ErrorHandler }>()
);

export const updateBillingPaymentApprovalSuccess = createAction(
    '[Billing API] Update Billing Payment Approval Success',
    props<{ payload: Update<ColPaymentApproval> }>()
);

// -----------------------------------------------------------------------------------------------------
// Update Billing Payment Reject
// -----------------------------------------------------------------------------------------------------

export const updateBillingPaymentRejectRequest = createAction(
    '[Billing API] Update Billing Payment Reject Request',
    props<{ payload: { body: PaymApproval; id: number } }>()
);

export const updateBillingPaymentRejectFailure = createAction(
    '[Billing API] Update Billing Payment Reject Failure',
    props<{ payload: ErrorHandler }>()
);

export const updateBillingPaymentRejectSuccess = createAction(
    '[Billing API] Update Billing Payment Reject Success',
    props<{ payload: Update<ColPaymentReject> }>()
);

export const clearState = createAction('[Collection Page] Reset Collection Core State');

export const clearRejectReason = createAction('[Collection Page] Reset Reject Reason State');

export type FailureActions = 'fetchRejectReasonFailure';
