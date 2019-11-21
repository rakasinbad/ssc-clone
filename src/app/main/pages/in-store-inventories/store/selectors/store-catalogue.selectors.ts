import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromStoreCatalogue } from '../reducers';

export const getStoreCatalogueState = createFeatureSelector<fromStoreCatalogue.State>(
    fromStoreCatalogue.FEATURE_KEY
);

export const getAllStoreCatalogue = createSelector(
    getStoreCatalogueState,
    fromStoreCatalogue.selectAllStoreCatalogues
);

export const getTotalStoreCatalogue = createSelector(
    getStoreCatalogueState,
    state => state.storeCatalogues.total
);

export const getSelectedStoreCatalogueId = createSelector(
    getStoreCatalogueState,
    state => state.selectedStoreCatalogueId
);

export const getSourceType = createSelector(
    getStoreCatalogueState,
    state => state.source
);

export const getStoreCatalogue = createSelector(
    getStoreCatalogueState,
    state => state.storeCatalogues
);

export const getIsLoading = createSelector(
    getStoreCatalogueState,
    state => state.isLoading
);
