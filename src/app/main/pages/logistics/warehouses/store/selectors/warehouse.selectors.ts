import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromWarehousesCore from '../reducers';
import * as fromWarehouses from '../reducers/warehouse.reducer';

const getWarehousesCoreState = createFeatureSelector<
    fromWarehousesCore.FeatureState,
    fromWarehousesCore.State
>(fromWarehousesCore.featureKey);

export const getWarehouseEntitiesState = createSelector(
    getWarehousesCoreState,
    state => state.warehouses
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromWarehouses.adapter.getSelectors(getWarehouseEntitiesState);

const getTotalItem = createSelector(getWarehouseEntitiesState, state => state.total);

const getSelectedId = createSelector(getWarehouseEntitiesState, state => state.selectedId);

const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

const getIsLoading = createSelector(getWarehouseEntitiesState, state => state.isLoading);

export { getIsLoading, getSelectedId, getSelectedItem, getTotalItem };
