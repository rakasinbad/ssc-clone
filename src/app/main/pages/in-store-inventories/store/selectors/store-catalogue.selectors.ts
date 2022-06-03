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

export const getSelectedStoreCatalogue = createSelector(
    getStoreCatalogueState,
    getAllStoreCatalogue,
    (state, storeCatalogues) => storeCatalogues.filter(storeCatalogue => storeCatalogue.id === state.selectedStoreCatalogueId)[0]
);

export const getSelectedStoreCatalogueId = createSelector(
    getStoreCatalogueState,
    (state) => state.selectedStoreCatalogueId
);

export const getSourceType = createSelector(
    getStoreCatalogueState,
    state => state.source
);

export const getStoreCatalogue = createSelector(
    getStoreCatalogueState,
    state => state.storeCatalogues
);

/**
 * CATALOGUE HISTORY
 */

export const getAllCatalogueHistory = createSelector(
    getStoreCatalogueState,
    fromStoreCatalogue.selectAllCatalogueHistories
);

export const getTotalCatalogueHistory = createSelector(
    getStoreCatalogueState,
    state => state.catalogueHistories.total
);

export const getCatalogueHistory = createSelector(
    getStoreCatalogueState,
    state => state.catalogueHistories
);

export const getIsLoading = createSelector(
    getStoreCatalogueState,
    state => state.isLoading
);
