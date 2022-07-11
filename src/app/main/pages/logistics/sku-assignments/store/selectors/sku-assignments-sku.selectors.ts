import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromSkuAssigmentsSku from '../reducers/sku-assignments-sku.reducer';
import * as fromSkuAssigments from '../reducers';

const getAssociationCoreState = createFeatureSelector<
    fromSkuAssigments.FeatureState,
    fromSkuAssigments.State
>(fromSkuAssigments.featureKey);

export const getSkuAssignmentsSkuEntitiesState = createSelector(
    getAssociationCoreState,
    state => state.skuAssignmentsSku
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromSkuAssigmentsSku.adapter.getSelectors(getSkuAssignmentsSkuEntitiesState);

const getTotalItem = createSelector(getSkuAssignmentsSkuEntitiesState, state => state.total);

const getSelectedId = createSelector(getSkuAssignmentsSkuEntitiesState, state => state.selectedId);

const getSearchValue = createSelector(getSkuAssignmentsSkuEntitiesState, state => state.textSearch);

const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

const getLoadingState = createSelector(getSkuAssignmentsSkuEntitiesState, state => state.isLoading);

export { getLoadingState, getSelectedId, getSelectedItem, getTotalItem, getSearchValue };
