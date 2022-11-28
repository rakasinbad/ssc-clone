import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromWarehousesCore from '../reducers';
import * as fromWarehouseSkuStocks from '../reducers/warehouse-sku-stock.reducer';

const getWarehouseSkuStocksCoreState = createFeatureSelector<
    fromWarehousesCore.FeatureState,
    fromWarehousesCore.State
>(fromWarehousesCore.featureKey);

export const getWarehouseSkuStockEntitiesState = createSelector(
    getWarehouseSkuStocksCoreState,
    state => state.warehouseSkuStocks
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromWarehouseSkuStocks.adapter.getSelectors(getWarehouseSkuStockEntitiesState);

const getTotalItem = createSelector(getWarehouseSkuStockEntitiesState, state => state.total);

const getSelectedId = createSelector(getWarehouseSkuStockEntitiesState, state => state.selectedId);

const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

const getIsLoading = createSelector(getWarehouseSkuStockEntitiesState, state => state.isLoading);

export { getIsLoading, getSelectedId, getSelectedItem, getTotalItem };
