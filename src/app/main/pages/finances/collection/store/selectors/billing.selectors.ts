import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromCollectionCore from '../reducers';
import * as fromBilling from '../reducers/billing.reducer';

export const getBillingStatusCoreState = createFeatureSelector<
    fromCollectionCore.FeatureState,
    fromCollectionCore.State
>(fromCollectionCore.featureKey);

export const getBillingStatusEntitiesState = createSelector(
    getBillingStatusCoreState,
    (state) => state.billingStatus
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal,
} = fromBilling.adapter.getSelectors(getBillingStatusEntitiesState);

export const getTotalItem = createSelector(getBillingStatusEntitiesState, (state) => state.total);

export const getSelectedId = createSelector(
    getBillingStatusEntitiesState,
    (state) => state.selectedId
);

export const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

export const getLoadingState = createSelector(
    getBillingStatusEntitiesState,
    (state) => state.isLoading
);
