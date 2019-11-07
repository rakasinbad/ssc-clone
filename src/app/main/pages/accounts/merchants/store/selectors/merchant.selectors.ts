import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromMerchant } from '../reducers';

export const getBrandStoreState = createFeatureSelector<fromMerchant.State>(
    fromMerchant.FEATURE_KEY
);

export const getAllBrandStore = createSelector(
    getBrandStoreState,
    fromMerchant.selectAllBrandStores
);

export const getAllStoreEmployee = createSelector(
    getBrandStoreState,
    fromMerchant.selectAllStoreEmployees
);

export const getBrandStoreEntities = createSelector(
    getBrandStoreState,
    fromMerchant.selectBrandStoreEntities
);

export const getStoreEmployeeEntities = createSelector(
    getBrandStoreState,
    fromMerchant.selectStoreEmployeeEntities
);

export const getTotalBrandStoreEntity = createSelector(
    getBrandStoreState,
    fromMerchant.selectBrandStoresTotal
);

export const getTotalStoreEmployeeEntity = createSelector(
    getBrandStoreState,
    fromMerchant.selectStoreEmployeesTotal
);

export const getTotalBrandStore = createSelector(
    getBrandStoreState,
    state => state.brandStores.total
);

export const getTotalStoreEmployee = createSelector(
    getBrandStoreState,
    state => state.employees.total
);

export const getSelectedBrandStoreId = createSelector(
    getBrandStoreState,
    state => state.selectedBrandStoreId
);

export const getSelectedBrandStore = createSelector(
    getBrandStoreEntities,
    getSelectedBrandStoreId,
    (brandStoreEntities, brandStoreId) => brandStoreEntities[brandStoreId]
);

export const getSelectedBrandStoreInfo = createSelector(
    getBrandStoreState,
    state => state.brandStore
);

export const getEditBrandStore = createSelector(
    getBrandStoreState,
    state => state.editBrandStore
);

export const getSelectedStoreEmployeeInfo = createSelector(
    getBrandStoreState,
    state => state.employee
);

export const getGoPage = createSelector(
    getBrandStoreState,
    state => state.goPage
);

export const getIsRefresh = createSelector(
    getBrandStoreState,
    state => state.isRefresh
);

export const getIsLoading = createSelector(
    getBrandStoreState,
    state => state.isLoading
);
