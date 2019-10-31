import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromCatalogue } from '../reducers';

export const getCatalogueState = createFeatureSelector<fromCatalogue.State>(fromCatalogue.FEATURE_KEY);

export const getAllCatalogues = createSelector(
    getCatalogueState,
    fromCatalogue.selectAllCatalogues
);

export const getTotalCatalogueEntity = createSelector(
    getCatalogueState,
    fromCatalogue.selectCataloguesTotal
);

export const getArchivedCatalogues = createSelector(
    getAllCatalogues,
    catalogues => catalogues.filter(catalogue => catalogue.isArchived)
);

export const getBlockedCatalogues = createSelector(
    getAllCatalogues,
    catalogues => catalogues.filter(catalogue => catalogue.blockType)
);

export const getEmptyStockCatalogues = createSelector(
    getAllCatalogues,
    catalogues => catalogues.filter(catalogue => !catalogue.stock)
);

export const getLiveCatalogues = createSelector(
    getAllCatalogues,
    catalogues => catalogues.filter(catalogue => catalogue.stock)
);
