import { createSelector } from '@ngrx/store';
import { adapter } from '../reducers/data-catalogue.reducer';
import { selectCatalogueSegmentationState } from './catalogue-segmentation.selector';

const selectCatalogueDataState = createSelector(
    selectCatalogueSegmentationState,
    (state) => state.dataCatalogue
);

export const { selectAll, selectEntities, selectIds, selectTotal } = adapter.getSelectors(
    selectCatalogueDataState
);

export const selectTotalItem = createSelector(selectCatalogueDataState, (state) => state.total);

export const selectSelectedId = createSelector(
    selectCatalogueDataState,
    (state) => state.selectedId
);

export const selectCurrentItem = createSelector(
    selectEntities,
    selectSelectedId,
    (entities, catalogueId) => entities[catalogueId]
);

export const selectIsLoading = createSelector(selectCatalogueDataState, (state) => state.isLoading);

export const selectIsRefresh = createSelector(selectCatalogueDataState, (state) => state.isRefresh);
