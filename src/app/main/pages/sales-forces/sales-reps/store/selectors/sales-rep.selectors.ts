import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromSalesReps from '../reducers/sales-rep.reducer';
import * as fromSalesRepsCore from '../reducers';

const getSalesRepsCoreState = createFeatureSelector<
    fromSalesRepsCore.FeatureState,
    fromSalesRepsCore.State
>(fromSalesRepsCore.featureKey);

export const getSalesRepEntitiesState = createSelector(
    getSalesRepsCoreState,
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

const getIsLoading = createSelector(getSalesRepEntitiesState, state => state.isLoading);

export { getIsLoading, getSelectedId, getSelectedItem, getTotalItem };
