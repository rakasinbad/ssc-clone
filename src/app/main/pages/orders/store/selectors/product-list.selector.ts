import { createSelector } from '@ngrx/store';
import { adapter } from '../reducers/product-list.reducer';
import { selectAddProductState } from './add-product.selector';

const selectProductListState = createSelector(
    selectAddProductState,
    (state) => state.productLists
);

export const { selectAll, selectEntities, selectIds, selectTotal } = adapter.getSelectors(
    selectProductListState
);

export const selectTotalItem = createSelector(selectProductListState, (state) => state.total);

export const selectSelectedId = createSelector(
    selectProductListState,
    (state) => state.selectedId
);

export const selectCurrentItem = createSelector(
    selectEntities,
    selectSelectedId,
    (entities, catalogueId) => entities[catalogueId]
);

export const selectIsLoading = createSelector(selectProductListState, (state) => state.isLoading);

export const selectIsRefresh = createSelector(selectProductListState, (state) => state.isRefresh);
