import { createAction, props } from '@ngrx/store';
import { IConfirmOrderPayment } from '../../models';
import { IError } from '../reducers/confirm-order-payment.reducer';

enum Actions {
    postConfirmRequest = '[CONFIRM ORDER PAYMENT] Confirm Request',
    postConfirmSuccess = '[CONFIRM ORDER PAYMENT] Confirm Success',
    postConfirmFailure = '[CONFIRM ORDER PAYMENT] Confirm Failure',
    ResetState = '[CONFIRM ORDER PAYMENT] Confirm Reset',
}

export const postConfirmRequest = createAction(
    Actions.postConfirmRequest,
    props<{ payload: IConfirmOrderPayment }>()
);

export const postConfirmSuccess = createAction(
    Actions.postConfirmSuccess,
    props<{ payload: any }>()
);

export const postConfirmFailure = createAction(
    Actions.postConfirmFailure,
    props<{ payload: IError }>()
);

export const resetState = createAction(Actions.ResetState);
