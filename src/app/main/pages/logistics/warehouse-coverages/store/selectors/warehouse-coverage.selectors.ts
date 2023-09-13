import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromWarehouseCoverages from '../reducers/warehouse-coverage.reducer';
import * as fromWarehouseCoveragesCore from '../reducers';

const getWarehouseCoverageCoreState = createFeatureSelector<
    fromWarehouseCoveragesCore.FeatureState,
    fromWarehouseCoveragesCore.State
>(fromWarehouseCoveragesCore.featureKey);

export const getWarehouseCoveragesState = createSelector(
    getWarehouseCoverageCoreState,
    state => state.warehouseCoverages
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromWarehouseCoverages.adapter.getSelectors(getWarehouseCoveragesState);

export const getTotalItem = createSelector(getWarehouseCoveragesState, state => state.total);

export const getSelectedId = createSelector(getWarehouseCoveragesState, state => state.selectedId);

export const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

export const getIsLoading = createSelector(getWarehouseCoveragesState, state => state.isLoading);
