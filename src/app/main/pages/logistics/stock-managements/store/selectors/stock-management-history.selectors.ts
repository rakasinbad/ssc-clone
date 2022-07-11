import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromStockManagementsCore from '../reducers';
import * as fromStockManagementHistories from '../reducers/stock-management-history.reducer';

const getSalesRepsCoreState = createFeatureSelector<
    fromStockManagementsCore.FeatureState,
    fromStockManagementsCore.State
>(fromStockManagementsCore.featureKey);

export const getStockManagementHistoryEntitiesState = createSelector(
    getSalesRepsCoreState,
    state => state.stockManagementHistories
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromStockManagementHistories.adapter.getSelectors(getStockManagementHistoryEntitiesState);

const getTotalItem = createSelector(getStockManagementHistoryEntitiesState, state => state.total);

const getSelectedId = createSelector(
    getStockManagementHistoryEntitiesState,
    state => state.selectedId
);

const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

const getIsLoading = createSelector(
    getStockManagementHistoryEntitiesState,
    state => state.isLoading
);

const getIsRefresh = createSelector(
    getStockManagementHistoryEntitiesState,
    state => state.isRefresh
);

export { getIsLoading, getIsRefresh, getSelectedId, getSelectedItem, getTotalItem };
