import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromJourneyPlansCore from '../reducers';
import * as fromJourneyPlans from '../reducers/journey-plan.reducer';

const getJourneyPlansCoreState = createFeatureSelector<
    fromJourneyPlansCore.FeatureState,
    fromJourneyPlansCore.State
>(fromJourneyPlansCore.featureKey);

export const getJourneyPlanEntitiesState = createSelector(
    getJourneyPlansCoreState,
    state => state.journeyPlans
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromJourneyPlans.adapter.getSelectors(getJourneyPlanEntitiesState);

const getTotalItem = createSelector(getJourneyPlanEntitiesState, state => state.total);

const getSelectedId = createSelector(getJourneyPlanEntitiesState, state => state.selectedId);

const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

const getViewBy = createSelector(getJourneyPlanEntitiesState, state => state.viewBy);

const getIsLoading = createSelector(getJourneyPlanEntitiesState, state => state.isLoading);

export { getIsLoading, getSelectedId, getSelectedItem, getTotalItem, getViewBy };
