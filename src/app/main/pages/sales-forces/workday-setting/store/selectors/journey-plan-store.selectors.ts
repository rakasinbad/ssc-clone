import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromJourneyPlansCore from '../reducers';
import * as fromJourneyPlanStores from '../reducers/journey-plan-store.reducer';

const getJourneyPlansCoreState = createFeatureSelector<
    fromJourneyPlansCore.FeatureState,
    fromJourneyPlansCore.State
>(fromJourneyPlansCore.featureKey);

export const getJourneyPlanStoresSourceEntitiesState = createSelector(
    getJourneyPlansCoreState,
    state => state.journeyPlanStoresSource
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromJourneyPlanStores.adapter.getSelectors(getJourneyPlanStoresSourceEntitiesState);

const getTotalItem = createSelector(getJourneyPlanStoresSourceEntitiesState, state => state.total);

const getSelectedId = createSelector(
    getJourneyPlanStoresSourceEntitiesState,
    state => state.selectedId
);

const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

const getType = createSelector(getJourneyPlanStoresSourceEntitiesState, state => state.type);

const getInvoiceGroupId = createSelector(
    getJourneyPlanStoresSourceEntitiesState,
    state => state.invoiceGroupId
);

const getIsLoading = createSelector(
    getJourneyPlanStoresSourceEntitiesState,
    state => state.isLoading
);

export { getInvoiceGroupId, getIsLoading, getSelectedId, getSelectedItem, getType, getTotalItem };
