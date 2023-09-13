import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromWarehouseCatalogue from '../reducers/warehouse-catalogue.reducer';
import * as fromSkuAssigments from '../reducers';

const getAssociationCoreState = createFeatureSelector<
    fromSkuAssigments.FeatureState,
    fromSkuAssigments.State
>(fromSkuAssigments.featureKey);

export const getWarehouseCatalogueEntitiesState = createSelector(
    getAssociationCoreState,
    state => state.warehouseCatalogue
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromWarehouseCatalogue.adapter.getSelectors(getWarehouseCatalogueEntitiesState);

const getTotalItem = createSelector(getWarehouseCatalogueEntitiesState, state => state.total);

const getSelectedId = createSelector(
    getWarehouseCatalogueEntitiesState,
    state => state.selectedId
);

const getSearchValue = createSelector(
    getWarehouseCatalogueEntitiesState,
    state => state.textSearch
);

const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

const getLoadingState = createSelector(
    getWarehouseCatalogueEntitiesState,
    state => state.isLoading
);

export { getLoadingState, getSelectedId, getSelectedItem, getTotalItem, getSearchValue };
