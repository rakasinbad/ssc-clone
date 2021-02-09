import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromImportMassUpload from '../reducers';
import * as fromMassUploads from '../reducers/store.reducer';

export const getMassUploadCoreState = createFeatureSelector<
fromImportMassUpload.FeatureState,
fromImportMassUpload.State
>(fromImportMassUpload.featureKey);

export const getMassUploadEntitiesState = createSelector(
    getMassUploadCoreState,
    (state) => state.massUpload
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal,
} = fromMassUploads.adapter.getSelectors(getMassUploadEntitiesState);

export const getTotalItem = createSelector(getMassUploadEntitiesState, (state) => state.total);

export const getSelectedId = createSelector(
    getMassUploadEntitiesState,
    (state) => state.selectedId
);

export const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

export const getIsLoading = createSelector(getMassUploadEntitiesState, (state) => state.isLoading);