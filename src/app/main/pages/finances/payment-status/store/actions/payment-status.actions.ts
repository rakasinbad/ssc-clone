import { Update } from '@ngrx/entity';
import { createAction, props } from '@ngrx/store';
import { IErrorHandler, IQueryParams } from 'app/shared/models';

import { IPaymentStatusDemo, IStatusPayment } from './../../models';

// -----------------------------------------------------------------------------------------------------
// Fetch Payment Statuses
// -----------------------------------------------------------------------------------------------------

export const fetchPaymentStatusesRequest = createAction(
    '[Payment Statuses API] Fetch Payment Statuses Request',
    props<{ payload: IQueryParams }>()
);

export const fetchPaymentStatusesFailure = createAction(
    '[Payment Statuses API] Fetch Payment Statuses Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchPaymentStatusesSuccess = createAction(
    '[Payment Statuses API] Fetch Payment Statuses Success',
    props<{ payload: { data: any; total: number } }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Calculate Orders by Payment
// -----------------------------------------------------------------------------------------------------

export const fetchCalculateOrdersByPaymentRequest = createAction(
    '[Calculate Orders API] Fetch Calculate Orders Type Payment Request'
);

export const fetchCalculateOrdersByPaymentFailure = createAction(
    '[Calculate Orders API] Fetch Calculate Orders Type Payment Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchCalculateOrdersByPaymentSuccess = createAction(
    '[Calculate Orders API] Fetch Calculate Orders Type Payment Success',
    props<{ payload: IStatusPayment }>()
);

// -----------------------------------------------------------------------------------------------------
// EXPORT Payment
// -----------------------------------------------------------------------------------------------------

export const exportRequest = createAction(
    '[Payment Status Page] Export Request',
    props<{ payload: { status?: any; dateGte?: string; dateLte?: string } }>()
);

export const exportFailure = createAction(
    '[Payment Status Page] Export Failure',
    props<{ payload: IErrorHandler }>()
);

export const exportSuccess = createAction(
    '[Payment Status Page] Export Success',
    props<{ payload: string }>()
);

// -----------------------------------------------------------------------------------------------------
// IMPORT Payment
// -----------------------------------------------------------------------------------------------------

export const importRequest = createAction(
    '[Payment Status Page] Import Request',
    props<{ payload: { file: File; type: string } }>()
);

export const importFailure = createAction(
    '[Payment Status Page] Import Failure',
    props<{ payload: IErrorHandler }>()
);

export const importSuccess = createAction('[Payment Status Page] Import Success');

// -----------------------------------------------------------------------------------------------------
// [CRUD - UPDATE PAYMENT STATUS] Payment Statuses
// -----------------------------------------------------------------------------------------------------

export const confirmUpdatePaymentStatus = createAction(
    '[Payment Statuses API] Confirm Update Payment Status Request',
    props<{ payload: any }>()
);

export const updatePaymentStatusRequest = createAction(
    '[Payment Statuses API] Update Payment Status Request',
    props<{ payload: { id: string; body: any } }>()
);

export const updatePaymentStatusFailure = createAction(
    '[Payment Statuses API] Update Payment Status Failure',
    props<{ payload: IErrorHandler }>()
);

export const updatePaymentStatusSuccess = createAction(
    '[Payment Statuses API] Update Payment Status Success',
    props<{ payload: Update<any> }>()
);

// -----------------------------------------------------------------------------------------------------
// Reset Actions
// -----------------------------------------------------------------------------------------------------

export const resetPaymentStatuses = createAction(
    '[Payment Statuses Page] Reset Payment Statuses State'
);

// -----------------------------------------------------------------------------------------------------
// Helper Actions
// -----------------------------------------------------------------------------------------------------

export const filterStatusPayment = createAction(
    '[Payment Statuses Page] Filter Payment Statuses',
    props<{ payload: string }>()
);

// -----------------------------------------------------------------------------------------------------
// For Demo
// -----------------------------------------------------------------------------------------------------

export const generatePaymentsDemo = createAction(
    '[Payment Page] Generate Payments Demo',
    props<{ payload: IPaymentStatusDemo[] }>()
);

export const getPaymentDemoDetail = createAction(
    '[Payment Page] Get Payment Demo Detail',
    props<{ payload: string }>()
);
