import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromCollectionTypeCore from '../reducers';
import * as fromCollectionType from '../reducers/collection-type.reducer';


export const getCollectionTypeCoreState = createFeatureSelector<
    fromCollectionTypeCore.FeatureState,
    fromCollectionTypeCore.State
>(fromCollectionTypeCore.featureKey);

export const getCollectionTypeEntitiesState = createSelector(
    getCollectionTypeCoreState,
    (state) => state.collectionTypes
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal,
} = fromCollectionType.adapter.getSelectors(getCollectionTypeEntitiesState);

export const getTotalItem = createSelector(getCollectionTypeEntitiesState, (state) => state.total);

export const getSelectedId = createSelector(
    getCollectionTypeEntitiesState,
    (state) => state.selectedId
);

export const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

export const getLoadingState = createSelector(
    getCollectionTypeEntitiesState,
    (state) => state.isLoading
);

export const getCalculateData = createSelector(getCollectionTypeEntitiesState, (state) => state.calculateData);
