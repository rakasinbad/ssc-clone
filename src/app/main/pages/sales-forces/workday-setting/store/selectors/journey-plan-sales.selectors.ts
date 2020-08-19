import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromJourneyPlansCore from '../reducers';
import * as fromJourneyPlanSales from '../reducers/journey-plan-sales.reducer';

const getJourneyPlansCoreState = createFeatureSelector<
    fromJourneyPlansCore.FeatureState,
    fromJourneyPlansCore.State
>(fromJourneyPlansCore.featureKey);

export const getJourneyPlanSalesEntitiesState = createSelector(
    getJourneyPlansCoreState,
    state => state.journeyPlanSales
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromJourneyPlanSales.adapter.getSelectors(getJourneyPlanSalesEntitiesState);

const getTotalItem = createSelector(getJourneyPlanSalesEntitiesState, state => state.total);

const getSelectedId = createSelector(getJourneyPlanSalesEntitiesState, state => state.selectedId);

const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

const getIsLoading = createSelector(getJourneyPlanSalesEntitiesState, state => state.isLoading);

export { getIsLoading, getSelectedId, getSelectedItem, getTotalItem };
