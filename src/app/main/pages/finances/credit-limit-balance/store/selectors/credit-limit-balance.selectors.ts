import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromCreditLimitBalance } from '../reducers';

export const getCreditLimitBalanceState = createFeatureSelector<fromCreditLimitBalance.State>(
    fromCreditLimitBalance.FEATURE_KEY
);

export const getAllCreditLimitBalance = createSelector(
    getCreditLimitBalanceState,
    fromCreditLimitBalance.selectAllCreditLimitBalance
);

export const getAllCreditLimitGroup = createSelector(
    getCreditLimitBalanceState,
    fromCreditLimitBalance.selectAllCreditLimitGroup
);

export const getCreditLimitBalanceEntities = createSelector(
    getCreditLimitBalanceState,
    fromCreditLimitBalance.selectCreditLimitBalanceEntities
);

export const getCreditLimitGroupEntities = createSelector(
    getCreditLimitBalanceState,
    fromCreditLimitBalance.selectCreditLimitGroupEntities
);

export const getTotalCreditLimitBalanceEntity = createSelector(
    getCreditLimitBalanceState,
    fromCreditLimitBalance.selectCreditLimitBalanceTotal
);

export const getTotalCreditLimitGroupEntity = createSelector(
    getCreditLimitBalanceState,
    fromCreditLimitBalance.selectCreditLimitGroupTotal
);

export const getTotalCreditLimitBalance = createSelector(
    getCreditLimitBalanceState,
    state => state.creditLimitBalance.total
);

export const getSelectedCreditLimitBalanceId = createSelector(
    getCreditLimitBalanceState,
    state => state.selectedCreditLimitBalanceId
);

export const getSelectedCreditLimitBalance = createSelector(
    getCreditLimitBalanceEntities,
    getSelectedCreditLimitBalanceId,
    (creditLimitBalanceEntities, creditLimitBalanceId) =>
        creditLimitBalanceEntities[creditLimitBalanceId]
);

export const getSelectedCreditLimitGroupId = createSelector(
    getCreditLimitBalanceState,
    state => state.selectedCreditLimitGroupId
);

export const getSelectedCreditLimitGroup = createSelector(
    getCreditLimitGroupEntities,
    getSelectedCreditLimitGroupId,
    (entities, id) => entities[id]
);

export const getIsRefresh = createSelector(getCreditLimitBalanceState, state => state.isRefresh);

export const getIsLoading = createSelector(getCreditLimitBalanceState, state => state.isLoading);
