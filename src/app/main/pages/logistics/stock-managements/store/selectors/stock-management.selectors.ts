import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromStockManagementsCore from '../reducers';
import * as fromStockManagements from '../reducers/stock-management.reducer';

const getSalesRepsCoreState = createFeatureSelector<
    fromStockManagementsCore.FeatureState,
    fromStockManagementsCore.State
>(fromStockManagementsCore.featureKey);

export const getStockManagementEntitiesState = createSelector(
    getSalesRepsCoreState,
    state => state.stockManagements
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromStockManagements.adapter.getSelectors(getStockManagementEntitiesState);

const getTotalItem = createSelector(getStockManagementEntitiesState, state => state.total);

const getSelectedId = createSelector(getStockManagementEntitiesState, state => state.selectedId);

const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

const getIsLoading = createSelector(getStockManagementEntitiesState, state => state.isLoading);

export { getIsLoading, getSelectedId, getSelectedItem, getTotalItem };
