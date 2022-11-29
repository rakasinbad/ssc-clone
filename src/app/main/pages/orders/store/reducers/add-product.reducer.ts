import { Action, combineReducers } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';
import * as fromProductList from './product-list.reducer';
import * as fromOrderCheckout from './order-checkout.reducer';
import * as fromPaymentOption from './payment-options.reducer';

export const addProductFeatureKey = 'addProducts';

export interface State {
    [fromProductList.productListFeatureKey]: fromProductList.State;
    [fromOrderCheckout.orderCheckoutFeatureKey]: fromOrderCheckout.State;
    [fromPaymentOption.paymentOptionFeatureKey]: fromPaymentOption.State;
}

export interface FeatureStateAddProduct extends fromRoot.State {
    [addProductFeatureKey]: State | undefined;
}

export function reducers(state: State | undefined, action: Action): State {
    return combineReducers({
        [fromProductList.productListFeatureKey]: fromProductList.reducer,
        [fromOrderCheckout.orderCheckoutFeatureKey]: fromOrderCheckout.reducer,
        [fromPaymentOption.paymentOptionFeatureKey]: fromPaymentOption.reducer,
    })(state, action);
}
