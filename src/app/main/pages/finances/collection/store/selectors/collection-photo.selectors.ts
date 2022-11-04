import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromCollectionCore from '../reducers';

const getCollectionPhotoCoreState = createFeatureSelector<
    fromCollectionCore.FeatureState,
    fromCollectionCore.State
>(fromCollectionCore.featureKey);

const getCollectionPhotoEntitiesState = createSelector(
    getCollectionPhotoCoreState,
    (state) => state.collectionPhoto
);

// export const { selectIds } =
//     fromCollectionPhoto.adapter.getSelectors(getCollectionPhotoEntitiesState);

export const getId = createSelector(
    getCollectionPhotoEntitiesState,
    (state) => state
);
export const getImage = createSelector(getCollectionPhotoEntitiesState, (state) => state.image);
export const getSkpImage = createSelector(getCollectionPhotoEntitiesState, (state) => state.skpImage);
export const getIsLoading = createSelector(
    getCollectionPhotoEntitiesState,
    (state) => state.isLoading
);