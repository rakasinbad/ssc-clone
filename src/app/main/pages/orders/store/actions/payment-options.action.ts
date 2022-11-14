import { createAction, props } from '@ngrx/store';
import { ErrorHandler, EStatus } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { Update } from '@ngrx/entity';
import { PaymentValidation, ParamPaymentVal } from '../../models';

// -----------------------------------------------------------------------------------------------------
// Fetch Payment Validation List
// -----------------------------------------------------------------------------------------------------

export const fetchPaymentValidRequest = createAction(
    '[Payment Validation API] Fetch Payment Validation List Request',
    props<{ payload: ParamPaymentVal }>()
);

export const fetchPaymentValidFailure = createAction(
    '[Payment Validation API] Fetch Payment Validation List Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchPaymentValidSuccess = createAction(
    '[Payment Validation API] Fetch Payment Validation List Success',
    props<{ payload: { data: PaymentValidation[], orderParcelId: number, brandName: string } }>()
);

export const setRefreshPaymentValid = createAction(
    '[Payment Validation Page] Set Refresh Status',
    props<{ payload: boolean }>()
);

export const clearState = createAction('[Payment Validationt Page] Reset Product List Core State');

export type FailureActions = 'fetchPaymentValidFailure';
