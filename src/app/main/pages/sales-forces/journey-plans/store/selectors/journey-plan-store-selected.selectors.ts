import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromJourneyPlansCore from '../reducers';
import * as fromJourneyPlanStores from '../reducers/journey-plan-store.reducer';

const getJourneyPlansCoreState = createFeatureSelector<
    fromJourneyPlansCore.FeatureState,
    fromJourneyPlansCore.State
>(fromJourneyPlansCore.featureKey);

export const getJourneyPlanStoresSelectedEntitiesState = createSelector(
    getJourneyPlansCoreState,
    state => state.journeyPlanStoresSelected
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromJourneyPlanStores.adapter.getSelectors(getJourneyPlanStoresSelectedEntitiesState);

const getTotalItem = createSelector(
    getJourneyPlanStoresSelectedEntitiesState,
    state => state.total
);

const getSelectedId = createSelector(
    getJourneyPlanStoresSelectedEntitiesState,
    state => state.selectedId
);

const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

const getType = createSelector(getJourneyPlanStoresSelectedEntitiesState, state => state.type);

const getIsLoading = createSelector(
    getJourneyPlanStoresSelectedEntitiesState,
    state => state.isLoading
);

export { getIsLoading, getSelectedId, getSelectedItem, getType, getTotalItem };
