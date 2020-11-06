import { createSelector } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';
import { adapter } from '../reducers/data-catalogue-segmentation.reducer';
import { selectCatalogueSegmentationState } from './catalogue-segmentation.selector';

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
