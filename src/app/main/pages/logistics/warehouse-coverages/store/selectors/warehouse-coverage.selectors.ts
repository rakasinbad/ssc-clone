import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromWarehouseCoveragesCore from '../reducers';
import * as fromWarehouseCoverages from '../reducers/warehouse-coverage.reducer';

const getSalesRepsCoreState = createFeatureSelector<
    fromWarehouseCoveragesCore.FeatureState,
    fromWarehouseCoveragesCore.State
>(fromWarehouseCoveragesCore.featureKey);

export const getWarehouseEntitiesState = createSelector(
    getSalesRepsCoreState,
    state => state.warehouseCoverages
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromWarehouseCoverages.adapter.getSelectors(getWarehouseEntitiesState);

const getTotalItem = createSelector(getWarehouseEntitiesState, state => state.total);

const getSelectedId = createSelector(getWarehouseEntitiesState, state => state.selectedId);

const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

const getIsLoading = createSelector(getWarehouseEntitiesState, state => state.isLoading);

export { getIsLoading, getSelectedId, getSelectedItem, getTotalItem };
