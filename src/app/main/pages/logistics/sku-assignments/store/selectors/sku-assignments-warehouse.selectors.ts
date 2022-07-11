import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromSkuAssigmentsWarehouse from '../reducers/sku-assignments-warehouse.reducer';
import * as fromSkuAssigments from '../reducers';

const getAssociationCoreState = createFeatureSelector<
    fromSkuAssigments.FeatureState,
    fromSkuAssigments.State
>(fromSkuAssigments.featureKey);

export const getSkuAssignmentsWarehouseEntitiesState = createSelector(
    getAssociationCoreState,
    state => state.skuAssignmentsWarehouse
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromSkuAssigmentsWarehouse.adapter.getSelectors(getSkuAssignmentsWarehouseEntitiesState);

const getTotalItem = createSelector(getSkuAssignmentsWarehouseEntitiesState, state => state.total);

const getSelectedId = createSelector(
    getSkuAssignmentsWarehouseEntitiesState,
    state => state.selectedId
);

const getSearchValue = createSelector(
    getSkuAssignmentsWarehouseEntitiesState,
    state => state.textSearch
);

const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

const getLoadingState = createSelector(
    getSkuAssignmentsWarehouseEntitiesState,
    state => state.isLoading
);

export { getLoadingState, getSelectedId, getSelectedItem, getTotalItem, getSearchValue };
