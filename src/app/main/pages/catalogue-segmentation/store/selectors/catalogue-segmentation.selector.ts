import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';
import { fromCatalogueSegmentation } from '../reducers';
import { adapter } from '../reducers/data-catalogue-segmentation.reducer';

const selectCatalogueSegmentationState = createFeatureSelector<
    fromCatalogueSegmentation.FeatureState,
    fromCatalogueSegmentation.State
>(fromCatalogueSegmentation.catalogueSegmentationFeatureKey);

const selectCatalogueSegmentationDataState = createSelector(
    selectCatalogueSegmentationState,
    (state) => state.dataCatalogueSegmentation
);

export const { selectAll, selectEntities, selectIds, selectTotal } = adapter.getSelectors(
    selectCatalogueSegmentationDataState
);

export const selectTotalItem = createSelector(
    selectCatalogueSegmentationDataState,
    (state) => state.total
);

export const selectSelectedId = createSelector(
    selectCatalogueSegmentationDataState,
    (state) => state.selectedId
);

export const selectSelectedCatalogueSegmentationId = fromRoot.selectRouteParam('id');

export const selectCurrentItem = createSelector(
    selectEntities,
    selectSelectedCatalogueSegmentationId,
    (entities, catalogueSegmentationId) => entities[catalogueSegmentationId]
);

export const selectIsLoading = createSelector(
    selectCatalogueSegmentationDataState,
    (state) => state.isLoading
);

export const selectIsRefresh = createSelector(
    selectCatalogueSegmentationDataState,
    (state) => state.isRefresh
);
