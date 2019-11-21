import { createAction, props } from '@ngrx/store';
import { IErrorHandler, IQueryParams } from 'app/shared/models';

import { IPaymentStatusDemo } from './../../models';

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
