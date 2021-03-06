import { createFeatureSelector, createSelector } from '@ngrx/store';
import { fromCatalogue } from '../reducers';

export const getCatalogueState = createFeatureSelector<fromCatalogue.State>(
    fromCatalogue.FEATURE_KEY
);

export const getAllTotalCatalogue = createSelector(getCatalogueState, (state) => ({
    totalActive: state.totalActive,
    totalAllStatus: state.totalAllStatus,
    totalBonus: state.totalBonus,
    totalInactive: state.totalInactive,
    totalRegular: state.totalRegular,
    totalExclusive: state.totalExclusive,
}));

export const getCataloguesEntity = createSelector(
    getCatalogueState,
    fromCatalogue.selectCatalogueEntities
);

export const getSelectedCatalogueId = createSelector(
    getCatalogueState,
    (state) => state.selectedCatalogueId
);

export const getSelectedCatalogueEntity = createSelector(
    getCataloguesEntity,
    getSelectedCatalogueId,
    (catalogue, id) => {
        return catalogue[id];
    }
);

export const getTotalCatalogueByStatusAll = createSelector(
    getCatalogueState,
    (state) => state.totalAllStatus
);

/* export const getTotalCatalogueByStatusEmpty = createSelector(
    getCatalogueState,
    (state) => state.totalEmptyStock
); */

export const getTotalCatalogueByStatusActive = createSelector(
    getCatalogueState,
    (state) => state.totalActive
);

export const getTotalCatalogueByStatusInactive = createSelector(
    getCatalogueState,
    (state) => state.totalInactive
);

/* export const getTotalCatalogueByStatusBanned = createSelector(
    getCatalogueState,
    (state) => state.totalBanned
); */

export const getProductName = createSelector(getCatalogueState, (state) => state.productName);

export const getCatalogueCategories = createSelector(
    getCatalogueState,
    (state) => state.categories
);

export const getCategoryTree = createSelector(getCatalogueState, (state) => state.categoryTree);

export const getRefreshStatus = createSelector(getCatalogueState, (state) => state.needRefresh);

export const getSelectedCatalogue = createSelector(getCatalogueState, (state) => state.catalogue);

export const getCatalogueUnits = createSelector(getCatalogueState, (state) => state.units);

export const getSelectedCategories = createSelector(
    getCatalogueState,
    (state) => state.selectedCategories
);

export const getAllCatalogues = createSelector(
    getCatalogueState,
    fromCatalogue.selectAllCatalogues
);

export const getTotalCatalogue = createSelector(
    getCatalogueState,
    (state) => state.catalogues.total
);

export const getTotalCatalogueEntity = createSelector(
    getCatalogueState,
    fromCatalogue.selectCataloguesTotal
);

export const getInactiveCatalogues = createSelector(getAllCatalogues, (catalogues) =>
    catalogues.filter((catalogue) => catalogue.status === 'inactive')
);

export const getBlockedCatalogues = createSelector(getAllCatalogues, (catalogues) =>
    catalogues.filter((catalogue) => catalogue.status === 'banned')
);

export const getEmptyStockCatalogues = createSelector(getAllCatalogues, (catalogues) =>
    catalogues.filter((catalogue) => !catalogue.stock || catalogue.stock <= 0)
);

export const getLiveCatalogues = createSelector(getAllCatalogues, (catalogues) =>
    catalogues.filter((catalogue) => catalogue.stock)
);

export const getCataloguePriceSettingsEntityTotal = createSelector(
    getCatalogueState,
    fromCatalogue.selectCataloguePricesTotal
);

export const getCataloguePriceSettingsEntityIds = createSelector(
    getCatalogueState,
    fromCatalogue.selectCataloguePriceIds
);

export const getCataloguePriceSettings = createSelector(
    getCatalogueState,
    fromCatalogue.selectAllCataloguePrices
);

export const getCataloguePriceSettingsEntity = createSelector(
    getCatalogueState,
    fromCatalogue.selectCataloguePriceEntities
);

export const getTotalCataloguePriceSettings = createSelector(
    getCatalogueState,
    (state) => state.cataloguePrices.total
);

export const getIsLoading = createSelector(getCatalogueState, (state) => state.isLoading);

export const getUpdatingActivity = createSelector(getCatalogueState, (state) => state.isUpdating);
