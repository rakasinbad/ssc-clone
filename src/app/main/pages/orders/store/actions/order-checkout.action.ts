import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { CreateManualOrder, ProductCheckout } from '../../models';
import { ILimitOrder } from '../reducers/confirm-order-payment.reducer';

// -----------------------------------------------------------------------------------------------------
// Create + get Data Order Checkout
// -----------------------------------------------------------------------------------------------------

export const fetchCheckoutOrderRequest = createAction(
    '[Create Checkout] Fetch Checkout Order Request',
    props<{ payload: CreateManualOrder }>()
);

export const fetchCheckoutOrderFailure = createAction(
    '[Create Checkout] Fetch Checkout Order Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchCheckoutOrderSuccess = createAction(
    '[Create Checkout] Fetch Checkout Order Success',
    props<{ payload: ProductCheckout }>()
);

export const setRefreshStatusCheckout = createAction(
    '[Create Checkout] Set Refresh Status Checkout Order',
    props<{ payload: boolean }>()
);

export const fetchCheckoutOrderWithErrorConfirmOrder = createAction(
    '[Create Checkout] Fetch Checkout Order With Error Confirm Order',
    props<{ payload: ILimitOrder[] }>()
);

export const clearState = createAction('[Create Checkout Page] Reset Checkout Order Core State');

export type FailureActions = 'fetchCheckoutOrderFailure';
