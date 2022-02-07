import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromCollectionCore from '../reducers';
import * as fromBillingDetail from '../reducers/billing-detail.reducer';

export const getBillingDetailCoreState = createFeatureSelector<
    fromCollectionCore.FeatureState,
    fromCollectionCore.State
>(fromCollectionCore.featureKey);

export const getBillingDetailEntitiesState = createSelector(
    getBillingDetailCoreState,
    (state) => state.billingDetailStatus
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal,
} = fromBillingDetail.adapterDetail.getSelectors(getBillingDetailEntitiesState);

export const getTotalItem = createSelector(getBillingDetailEntitiesState, (state) => state.total);

export const getSelectedId = createSelector(
    getBillingDetailEntitiesState,
    (state) => state.selectedId
);

export const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

export const getLoadingState = createSelector(
    getBillingDetailEntitiesState,
    (state) => state.isLoading
);
