import { createSelector } from '@ngrx/store';
import { adapter } from '../reducers/data-available-catalogue.reducer';
import { selectCatalogueSegmentationState } from './catalogue-segmentation.selector';

const selectAvailableCatalogueDataState = createSelector(
    selectCatalogueSegmentationState,
    (state) => state.dataAvailableCatalogue
);

export const { selectAll, selectEntities, selectIds, selectTotal } = adapter.getSelectors(
    selectAvailableCatalogueDataState
);

export const selectTotalItem = createSelector(
    selectAvailableCatalogueDataState,
    (state) => state.total
);

export const selectSelectedId = createSelector(
    selectAvailableCatalogueDataState,
    (state) => state.selectedId
);

export const selectCurrentItem = createSelector(
    selectEntities,
    selectSelectedId,
    (entities, catalogueSegmentationId) => entities[catalogueSegmentationId]
);

export const selectIsLoading = createSelector(
    selectAvailableCatalogueDataState,
    (state) => state.isLoading
);

export const selectIsRefresh = createSelector(
    selectAvailableCatalogueDataState,
    (state) => state.isRefresh
);
