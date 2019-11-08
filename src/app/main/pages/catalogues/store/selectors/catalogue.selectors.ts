import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromCatalogue } from '../reducers';

export const getCatalogueState = createFeatureSelector<fromCatalogue.State>(fromCatalogue.FEATURE_KEY);

export const getProductName = createSelector(
    getCatalogueState,
    state => state.productName
);

export const getCategoryTree = createSelector(
    getCatalogueState,
    state => state.categories
);

export const getCatalogueUnits = createSelector(
    getCatalogueState,
    state => state.units
);

export const getSelectedCategories = createSelector(
    getCatalogueState,
    state => state.selectedCategories
);

export const getAllCatalogues = createSelector(
    getCatalogueState,
    fromCatalogue.selectAllCatalogues
);

export const getTotalCatalogue = createSelector(
    getCatalogueState,
    state => state.catalogues.total
);

export const getTotalCatalogueEntity = createSelector(
    getCatalogueState,
    fromCatalogue.selectCataloguesTotal
);

export const getArchivedCatalogues = createSelector(
    getAllCatalogues,
    catalogues => catalogues.filter(catalogue => catalogue.status === 'inactive')
);

export const getBlockedCatalogues = createSelector(
    getAllCatalogues,
    catalogues => catalogues.filter(catalogue => catalogue.status === 'banned')
);

export const getEmptyStockCatalogues = createSelector(
    getAllCatalogues,
    catalogues => catalogues.filter(catalogue => !catalogue.stock || catalogue.stock <= 0)
);

export const getLiveCatalogues = createSelector(
    getAllCatalogues,
    catalogues => catalogues.filter(catalogue => catalogue.stock)
);

export const getIsLoading = createSelector(
    getCatalogueState,
    state => state.isLoading
);
