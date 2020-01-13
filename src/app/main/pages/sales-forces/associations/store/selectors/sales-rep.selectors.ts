import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromSalesReps from '../reducers/sales-rep.reducer';
import * as fromAssociationCore from '../reducers';

const getAssociationCoreState = createFeatureSelector<
    fromAssociationCore.FeatureState,
    fromAssociationCore.State
>(fromAssociationCore.featureKey);

export const getSalesRepEntitiesState = createSelector(
    getAssociationCoreState,
    state => state.salesReps
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromSalesReps.adapter.getSelectors(getSalesRepEntitiesState);

const getTotalItem = createSelector(getSalesRepEntitiesState, state => state.total);

const getSelectedId = createSelector(getSalesRepEntitiesState, state => state.selectedId);

const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

const getLoadingState = createSelector(getSalesRepEntitiesState, state => state.isLoading);

export { getLoadingState, getSelectedId, getSelectedItem, getTotalItem };
