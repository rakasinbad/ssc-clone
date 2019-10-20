import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromMerchant } from '../reducers';

export const getStoreState = createFeatureSelector<fromMerchant.State>(fromMerchant.FEATURE_KEY);

export const getAllStore = createSelector(
    getStoreState,
    fromMerchant.selectAllStores
);

export const getAllStoreEmployee = createSelector(
    getStoreState,
    fromMerchant.selectAllStoreEmployees
);

export const getStoreEntities = createSelector(
    getStoreState,
    fromMerchant.selectStoreEntities
);

export const getStoreEmployeeEntities = createSelector(
    getStoreState,
    fromMerchant.selectStoreEmployeeEntities
);

export const getTotalStoreEntity = createSelector(
    getStoreState,
    fromMerchant.selectStoresTotal
);

export const getTotalStoreEmployeeEntity = createSelector(
    getStoreState,
    fromMerchant.selectStoreEmployeesTotal
);

export const getTotalStore = createSelector(
    getStoreState,
    state => state.stores.total
);

export const getSelectedStoreId = createSelector(
    getStoreState,
    state => state.selectedStoreId
);

export const getSelectedStore = createSelector(
    getStoreEntities,
    getSelectedStoreId,
    (storeEntities, storeId) => storeEntities[storeId]
);
