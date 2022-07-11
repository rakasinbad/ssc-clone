import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromWarehouseUrbans from '../reducers/warehouse-urban.reducer';
import * as fromWarehouseCoveragesCore from '../reducers';

const getWarehouseCoverageCoreState = createFeatureSelector<
    fromWarehouseCoveragesCore.FeatureState,
    fromWarehouseCoveragesCore.State
>(fromWarehouseCoveragesCore.featureKey);

export const getWarehouseUrbansState = createSelector(
    getWarehouseCoverageCoreState,
    state => state.coverages
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromWarehouseUrbans.adapter.getSelectors(getWarehouseUrbansState);

export const getTotalItem = createSelector(getWarehouseUrbansState, state => state.total);

export const getIsLoading = createSelector(getWarehouseUrbansState, state => state.isLoading);
