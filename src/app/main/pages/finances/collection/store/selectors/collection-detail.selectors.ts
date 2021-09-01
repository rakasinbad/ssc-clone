import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromCollectionCore from '../reducers';
import * as fromCollectionDetail from '../reducers/collection-detail.reducer';

export const getCollectionDetailCoreState = createFeatureSelector<
    fromCollectionCore.FeatureState,
    fromCollectionCore.State
>(fromCollectionCore.featureKey);

export const getCollectionDetailEntitiesState = createSelector(
    getCollectionDetailCoreState,
    (state) => state.collectionDetailStatus
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal,
} = fromCollectionDetail.adapter.getSelectors(getCollectionDetailEntitiesState);

export const getTotalItem = createSelector(getCollectionDetailEntitiesState, (state) => state.total);

export const getSelectedId = createSelector(
    getCollectionDetailEntitiesState,
    (state) => state.selectedId
);

export const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

export const getLoadingState = createSelector(
    getCollectionDetailEntitiesState,
    (state) => state.isLoading
);
