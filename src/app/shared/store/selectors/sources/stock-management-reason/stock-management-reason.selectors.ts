import { createFeatureSelector, createSelector } from '@ngrx/store';
import { fromSource } from 'app/shared/store/reducers';

import * as fromStockManagementReasons from '../../../reducers/sources/stock-management-reason/stock-management-reason.reducer';

const getSourcesCoreState = createFeatureSelector<fromSource.FeatureState, fromSource.State>(
    fromSource.featureKey
);

const getStockManagementReasonsCoreState = createSelector(
    getSourcesCoreState,
    state => state.stockManagementReasons
);

export const getStockManagementReasonEntitiesState = createSelector(
    getStockManagementReasonsCoreState,
    state => state.stockManagementReasons
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromStockManagementReasons.adapter.getSelectors(getStockManagementReasonEntitiesState);

const getTotalItem = createSelector(getStockManagementReasonEntitiesState, state => state.total);

const getSelectedId = createSelector(
    getStockManagementReasonEntitiesState,
    state => state.selectedId
);

const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

const getIsLoading = createSelector(
    getStockManagementReasonEntitiesState,
    state => state.isLoading
);

export { getIsLoading, getSelectedId, getSelectedItem, getTotalItem };
