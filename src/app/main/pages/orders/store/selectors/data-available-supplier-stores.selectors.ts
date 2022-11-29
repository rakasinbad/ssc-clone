import { createSelector } from '@ngrx/store';
import { adapter } from '../reducers/data-available-supplier-store.reducer';
import { selectAvailableSupplierStoreState } from './available-supplier-stores.selectors';

const selectAvailableSupplierStoreDataState = createSelector(
    selectAvailableSupplierStoreState,
    (state) => state.dataAvailableSupplierStore
);

export const { selectAll, selectEntities, selectTotal } = adapter.getSelectors(
    selectAvailableSupplierStoreDataState
);

export const selectTotalItem = createSelector(
    selectAvailableSupplierStoreDataState,
    (state) => state.total
);

export const selectSelectedId = createSelector(
    selectAvailableSupplierStoreDataState,
    (state) => state.selectedId
);

export const selectCurrentItem = createSelector(
    selectEntities,
    selectSelectedId,
    (entities, supplierStoreId) => entities[supplierStoreId]
);

export const selectIsLoading = createSelector(
    selectAvailableSupplierStoreDataState,
    (state) => state.isLoading
);

export const selectIsRefresh = createSelector(
    selectAvailableSupplierStoreDataState,
    (state) => state.isRefresh
);
