import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromCreditLimitBalance } from '../reducers';

export const getCreditLimitBalanceState = createFeatureSelector<fromCreditLimitBalance.State>(
    fromCreditLimitBalance.FEATURE_KEY
);

// -----------------------------------------------------------------------------------------------------
// Credit Limit Stores State
// -----------------------------------------------------------------------------------------------------

export const getAllCreditLimitStore = createSelector(
    getCreditLimitBalanceState,
    fromCreditLimitBalance.selectAllCreditLimitStore
);

export const getCreditLimitStoreEntities = createSelector(
    getCreditLimitBalanceState,
    fromCreditLimitBalance.selectCreditLimitStoreEntities
);

export const getTotalCreditLimitStoreEntity = createSelector(
    getCreditLimitBalanceState,
    fromCreditLimitBalance.selectCreditLimitStoreTotal
);

export const getTotalCreditLimitStore = createSelector(
    getCreditLimitBalanceState,
    state => state.creditLimitBalanceStores.total
);

export const getSelectedCreditLimitStoreId = createSelector(
    getCreditLimitBalanceState,
    state => state.creditLimitBalanceStores.selectedCreditLimitStoreId
);

export const getSelectedCreditLimitStore = createSelector(
    getCreditLimitStoreEntities,
    getSelectedCreditLimitStoreId,
    (entities, id) => entities[id]
);

// -----------------------------------------------------------------------------------------------------
// Credit Limit Groups State
// -----------------------------------------------------------------------------------------------------

export const getAllCreditLimitGroup = createSelector(
    getCreditLimitBalanceState,
    fromCreditLimitBalance.selectAllCreditLimitGroup
);

export const getCreditLimitGroupEntities = createSelector(
    getCreditLimitBalanceState,
    fromCreditLimitBalance.selectCreditLimitGroupEntities
);

export const getTotalCreditLimitGroupEntity = createSelector(
    getCreditLimitBalanceState,
    fromCreditLimitBalance.selectCreditLimitGroupTotal
);

export const getSelectedCreditLimitGroupId = createSelector(
    getCreditLimitBalanceState,
    state => state.creditLimitBalanceGroups.selectedCreditLimitGroupId
);

export const getSelectedCreditLimitGroup = createSelector(
    getCreditLimitGroupEntities,
    getSelectedCreditLimitGroupId,
    (entities, id) => entities[id]
);

// -----------------------------------------------------------------------------------------------------
// Helper State
// -----------------------------------------------------------------------------------------------------

export const getKeyword = createSelector(getCreditLimitBalanceState, state => state.keyword);

export const getIsRefresh = createSelector(getCreditLimitBalanceState, state => state.isRefresh);

export const getIsLoading = createSelector(getCreditLimitBalanceState, state => state.isLoading);
