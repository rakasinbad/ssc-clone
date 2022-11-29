import { createSelector } from '@ngrx/store';
import { adapter } from '../reducers/payment-options.reducer';
import { selectAddProductState } from './add-product.selector';

const selectPaymentValidListState = createSelector(
    selectAddProductState,
    (state) => state.paymentOptionLists
);

export const { selectAll, selectEntities, selectIds, selectTotal } = adapter.getSelectors(
    selectPaymentValidListState
);

export const selectTotalItem = createSelector(selectPaymentValidListState, (state) => state.total);

export const selectSelectedId = createSelector(
    selectPaymentValidListState,
    (state) => state.selectedId
);

export const selectCurrentItem = createSelector(
    selectEntities,
    selectSelectedId,
    (entities, id) => entities[id]
);

export const selectIsLoading = createSelector(selectPaymentValidListState, (state) => state.isLoading);

export const selectIsRefresh = createSelector(selectPaymentValidListState, (state) => state.isRefresh);
