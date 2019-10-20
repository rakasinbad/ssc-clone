import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromCreditLimitBalance } from '../reducers';

export const getCreditLimitBalanceState = createFeatureSelector<fromCreditLimitBalance.State>(
    fromCreditLimitBalance.FEATURE_KEY
);

export const getAllCreditLimitBalance = createSelector(
    getCreditLimitBalanceState,
    fromCreditLimitBalance.selectAllCreditLimitBalance
);

export const getCreditLimitBalanceEntities = createSelector(
    getCreditLimitBalanceState,
    fromCreditLimitBalance.selectCreditLimitBalanceEntities
);

export const getTotalCreditLimitBalanceEntity = createSelector(
    getCreditLimitBalanceState,
    fromCreditLimitBalance.selectCreditLimitBalanceTotal
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
