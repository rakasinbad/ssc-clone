import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromMerchant } from '../reducers';

const getAccountStoreState = createFeatureSelector<fromMerchant.State>(fromMerchant.FEATURE_KEY);

// -----------------------------------------------------------------------------------------------------
// Stores State
// -----------------------------------------------------------------------------------------------------

export const getAllStore = createSelector(getAccountStoreState, fromMerchant.selectAllStore);

export const getStoreEntities = createSelector(
    getAccountStoreState,
    fromMerchant.selectStoreEntities
);

export const getStoreIds = createSelector(getAccountStoreState, fromMerchant.selectStoreIds);

export const getTotalStoreEntity = createSelector(
    getAccountStoreState,
    fromMerchant.selectStoreTotal
);

export const getTotalStore = createSelector(getAccountStoreState, state => state.stores.total);

export const getSelectedStoreId = createSelector(
    getAccountStoreState,
    state => state.stores.selectedStoreId
);

export const getSelectedStore = createSelector(
    getStoreEntities,
    getSelectedStoreId,
    (entities, id) => entities[id]
);

// -----------------------------------------------------------------------------------------------------
// Store State
// -----------------------------------------------------------------------------------------------------

export const getStoreEdit = createSelector(getAccountStoreState, state => state.store);

// -----------------------------------------------------------------------------------------------------
// Employee State
// -----------------------------------------------------------------------------------------------------

export const getEmployeeEdit = createSelector(getAccountStoreState, state => state.employee);

// -----------------------------------------------------------------------------------------------------
// Store Employees State
// -----------------------------------------------------------------------------------------------------

export const getAllStoreEmployee = createSelector(
    getAccountStoreState,
    fromMerchant.selectAllStoreEmployee
);

export const getStoreEmployeeEntities = createSelector(
    getAccountStoreState,
    fromMerchant.selectStoreEmployeeEntities
);

export const getStoreEmployeeIds = createSelector(
    getAccountStoreState,
    fromMerchant.selectStoreEmployeeIds
);

export const getTotalStoreEmployeeEntity = createSelector(
    getAccountStoreState,
    fromMerchant.selectStoreEmployeeTotal
);

export const getTotalStoreEmployee = createSelector(
    getAccountStoreState,
    state => state.employees.total
);

export const getSelectedStoreEmployeeId = createSelector(
    getAccountStoreState,
    state => state.employees.selectedEmployeeId
);

export const getSelectedStoreEmployee = createSelector(
    getStoreEmployeeEntities,
    getSelectedStoreEmployeeId,
    (entities, id) => entities[id]
);

// -----------------------------------------------------------------------------------------------------
// Helper State
// -----------------------------------------------------------------------------------------------------

export const getGoPage = createSelector(getAccountStoreState, state => state.goPage);

export const getIsRefresh = createSelector(getAccountStoreState, state => state.isRefresh);

export const getIsLoading = createSelector(getAccountStoreState, state => state.isLoading);

// export const getAllBrandStore = createSelector(
//     getBrandStoreState,
//     fromMerchant.selectAllBrandStores
// );

// export const getAllStoreEmployee = createSelector(
//     getBrandStoreState,
//     fromMerchant.selectAllStoreEmployees
// );

// export const getBrandStoreEntities = createSelector(
//     getBrandStoreState,
//     fromMerchant.selectBrandStoreEntities
// );

// export const getStoreEmployeeEntities = createSelector(
//     getBrandStoreState,
//     fromMerchant.selectStoreEmployeeEntities
// );

// export const getTotalBrandStoreEntity = createSelector(
//     getBrandStoreState,
//     fromMerchant.selectBrandStoresTotal
// );

// export const getTotalStoreEmployeeEntity = createSelector(
//     getBrandStoreState,
//     fromMerchant.selectStoreEmployeesTotal
// );

// export const getTotalBrandStore = createSelector(
//     getBrandStoreState,
//     state => state.brandStores.total
// );

// export const getTotalStoreEmployee = createSelector(
//     getBrandStoreState,
//     state => state.employees.total
// );

// export const getSelectedBrandStoreId = createSelector(
//     getBrandStoreState,
//     state => state.selectedBrandStoreId
// );

// export const getSelectedBrandStore = createSelector(
//     getBrandStoreEntities,
//     getSelectedBrandStoreId,
//     (brandStoreEntities, brandStoreId) => brandStoreEntities[brandStoreId]
// );

// export const getSelectedBrandStoreInfo = createSelector(
//     getBrandStoreState,
//     state => state.brandStore
// );

// export const getEditBrandStore = createSelector(
//     getBrandStoreState,
//     state => state.editBrandStore
// );

// export const getSelectedStoreEmployeeInfo = createSelector(
//     getBrandStoreState,
//     state => state.employee
// );
