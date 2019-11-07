import { createAction, props } from '@ngrx/store';
import { IErrorHandler, IQueryParams } from 'app/shared/models';

import { IPaymentStatusDemo } from './../../models';

// -----------------------------------------------------------------------------------------------------
// Fetch Payment Status
// -----------------------------------------------------------------------------------------------------

export const fetchPaymentStatusRequest = createAction(
    '[Payment Status API] Fetch Payment Status Request',
    props<{ payload: IQueryParams }>()
);

export const fetchPaymentStatusFailure = createAction(
    '[Payment Status API] Fetch Payment Status Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchPaymentStatusSuccess = createAction(
    '[Payment Status API] Fetch Payment Status Success',
    props<{ payload: { paymentStatus: any; total: number } }>()
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
