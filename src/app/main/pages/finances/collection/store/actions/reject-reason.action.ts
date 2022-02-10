import { createAction, props } from '@ngrx/store';
import { ErrorHandler, EStatus } from 'app/shared/models/global.model';
import { Update } from '@ngrx/entity';
import { RejectReason, ColPaymentApproval, PaymApproval } from '../../models';

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
    props<{ payload: { body: PaymApproval; id: number } }>()
);

export const updateColPaymentApprovalFailure = createAction(
    '[Collection API] Update Collection Payment Approval Failure',
    props<{ payload: ErrorHandler }>()
);

export const updateColPaymentApprovalSuccess = createAction(
    '[Collection API] Update Collection Payment Approval Success',
    props<{ payload: Update<ColPaymentApproval> }>()
);

// -----------------------------------------------------------------------------------------------------
// Billing
// -----------------------------------------------------------------------------------------------------

// -----------------------------------------------------------------------------------------------------
// Update Billing Payment Approval
// -----------------------------------------------------------------------------------------------------

export const updateBillingPaymentApprovalRequest = createAction(
    '[Billing API] Update Billing Payment Approval Request',
    props<{ payload: { body: PaymApproval; id: number } }>()
);

export const updateBillingPaymentApprovalFailure = createAction(
    '[Billing API] Update Billing Payment Approval Failure',
    props<{ payload: ErrorHandler }>()
);

export const updateBillingPaymentApprovalSuccess = createAction(
    '[Billing API] Update Billing Payment Approval Success',
    props<{ payload: Update<ColPaymentApproval> }>()
);




export const clearState = createAction('[Collection Page] Reset Collection Core State');

export const clearRejectReason = createAction('[Collection Page] Reset Reject Reason State');

export type FailureActions = 'fetchRejectReasonFailure';
