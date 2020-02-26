import { createFeatureSelector, createSelector } from '@ngrx/store';
import { fromSource } from 'app/shared/store/reducers';

import * as fromWarehouses from '../../../reducers/sources/warehouse/warehouse.reducer';

const getSourcesCoreState = createFeatureSelector<fromSource.FeatureState, fromSource.State>(
    fromSource.featureKey
);

const getWarehousesCoreState = createSelector(getSourcesCoreState, state => state.warehouses);

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
