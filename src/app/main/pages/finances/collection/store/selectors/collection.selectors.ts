import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromCollectionCore from '../reducers';
import * as fromCollection from '../reducers/collection.reducer';
import * as fromBilling from '../reducers/billing.reducer';


export const getCollectionStatusCoreState = createFeatureSelector<
    fromCollectionCore.FeatureState,
    fromCollectionCore.State
>(fromCollectionCore.featureKey);

export const getCollectionStatusEntitiesState = createSelector(
    getCollectionStatusCoreState,
    (state) => state.collectionStatus
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal,
} = fromCollection.adapter.getSelectors(getCollectionStatusEntitiesState);

export const getTotalItem = createSelector(getCollectionStatusEntitiesState, (state) => state.total);

export const getSelectedId = createSelector(
    getCollectionStatusEntitiesState,
    (state) => state.selectedId
);

export const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

export const getLoadingState = createSelector(
    getCollectionStatusEntitiesState,
    (state) => state.isLoading
);
