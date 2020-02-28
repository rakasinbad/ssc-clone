import { createFeatureSelector, createSelector } from '@ngrx/store';
import { fromSource } from 'app/shared/store/reducers';

import * as fromWarehouseValues from '../../../reducers/sources/warehouse-value/warehouse-value.reducer';

const getSourcesCoreState = createFeatureSelector<fromSource.FeatureState, fromSource.State>(
    fromSource.featureKey
);

const getWarehouseValuesCoreState = createSelector(
    getSourcesCoreState,
    state => state.warehouseValues
);

export const getWarehouseValueEntitiesState = createSelector(
    getWarehouseValuesCoreState,
    state => state.warehouseValues
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromWarehouseValues.adapter.getSelectors(getWarehouseValueEntitiesState);

const getTotalItem = createSelector(getWarehouseValueEntitiesState, state => state.total);

const getSelectedId = createSelector(getWarehouseValueEntitiesState, state => state.selectedId);

const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

const getIsLoading = createSelector(getWarehouseValueEntitiesState, state => state.isLoading);

export { getIsLoading, getSelectedId, getSelectedItem, getTotalItem };
