import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromStockManagementsCore from '../reducers';
import * as fromStockManagementCatalogues from '../reducers/stock-management-catalogue.reducer';

const getSalesRepsCoreState = createFeatureSelector<
    fromStockManagementsCore.FeatureState,
    fromStockManagementsCore.State
>(fromStockManagementsCore.featureKey);

export const getStockManagementCatalogueEntitiesState = createSelector(
    getSalesRepsCoreState,
    state => state.stockManagementCatalogues
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromStockManagementCatalogues.adapter.getSelectors(getStockManagementCatalogueEntitiesState);

const getTotalItem = createSelector(getStockManagementCatalogueEntitiesState, state => state.total);

const getSelectedId = createSelector(
    getStockManagementCatalogueEntitiesState,
    state => state.selectedId
);

const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

const getIsLoading = createSelector(
    getStockManagementCatalogueEntitiesState,
    state => state.isLoading
);

export { getIsLoading, getSelectedId, getSelectedItem, getTotalItem };
