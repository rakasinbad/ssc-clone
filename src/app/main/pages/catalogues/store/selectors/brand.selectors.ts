import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromBrand } from '../reducers';

export const getBrandState = createFeatureSelector<fromBrand.State>(fromBrand.FEATURE_KEY);

export const getAllBrands = createSelector(getBrandState, fromBrand.selectAllBrands);

// export const getTotalCatalogue = createSelector(
//     getCatalogueState,
//     state => state.catalogues.total
// );

// export const getTotalCatalogueEntity = createSelector(
//     getCatalogueState,
//     fromCatalogue.selectCataloguesTotal
// );

// export const getArchivedCatalogues = createSelector(
//     getAllCatalogues,
//     catalogues => catalogues.filter(catalogue => catalogue.status === 'inactive')
// );

// export const getBlockedCatalogues = createSelector(
//     getAllCatalogues,
//     catalogues => catalogues.filter(catalogue => catalogue.status === 'banned')
// );

// export const getEmptyStockCatalogues = createSelector(
//     getAllCatalogues,
//     catalogues => catalogues.filter(catalogue => !catalogue.stock || catalogue.stock <= 0)
// );

// export const getLiveCatalogues = createSelector(
//     getAllCatalogues,
//     catalogues => catalogues.filter(catalogue => catalogue.stock)
// );

export const getIsLoading = createSelector(
    getBrandState,
    state => state.isLoading
);
