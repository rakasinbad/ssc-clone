import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromWarehousesCore from '../reducers';
import * as fromWarehouseCoverages from '../reducers/warehouse-coverage.reducer';

const getWarehouseCoveragesCoreState = createFeatureSelector<
    fromWarehousesCore.FeatureState,
    fromWarehousesCore.State
>(fromWarehousesCore.featureKey);

export const getWarehouseCoverageEntitiesState = createSelector(
    getWarehouseCoveragesCoreState,
    state => state.warehouseCoverages
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromWarehouseCoverages.adapter.getSelectors(getWarehouseCoverageEntitiesState);

const getTotalItem = createSelector(getWarehouseCoverageEntitiesState, state => state.total);

const getSelectedId = createSelector(getWarehouseCoverageEntitiesState, state => state.selectedId);

const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

const getIsLoading = createSelector(getWarehouseCoverageEntitiesState, state => state.isLoading);

export { getIsLoading, getSelectedId, getSelectedItem, getTotalItem };
