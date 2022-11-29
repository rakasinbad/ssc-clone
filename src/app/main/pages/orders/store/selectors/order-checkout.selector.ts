import { createSelector } from '@ngrx/store';
import { adapter } from '../reducers/order-checkout.reducer';
import { selectAddProductState } from './add-product.selector';
import * as fromOrderCheckout from '../reducers/order-checkout.reducer';

const selectOrderCheckoutState = createSelector(
    selectAddProductState,
    (state) => state.orderCheckouts
);

export const { selectAll, selectEntities, selectIds, selectTotal } =
    fromOrderCheckout.adapter.getSelectors(selectOrderCheckoutState);

export const selectSelectedId = createSelector(
    selectOrderCheckoutState,
    (state) => state.selectedId
);

export const getSelectedItem = createSelector(
    selectEntities,
    selectSelectedId,
    (entities, cartId) => entities[cartId]
);
export const getDataCheckout = createSelector(selectOrderCheckoutState, (state) => state.dataCheckout);

export const selectIsLoading = createSelector(selectOrderCheckoutState, (state) => state.isLoading);

export const selectIsRefresh = createSelector(selectOrderCheckoutState, (state) => state.isRefresh);