import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromBank } from '../reducers';

export const getBankState = createFeatureSelector<fromBank.State>(fromBank.FEATURE_KEY);

export const getAllBank = createSelector(getBankState, fromBank.selectAllBank);

export const getBankEntities = createSelector(getBankState, fromBank.selectBankEntities);

export const getTotalBankEntity = createSelector(getBankState, fromBank.selectBankTotal);

export const getTotalBank = createSelector(getBankState, state => state.banks.total);

export const getSelectedBankId = createSelector(getBankState, state => state.selectedBankId);

export const getSelectedBank = createSelector(
    getBankEntities,
    getSelectedBankId,
    (bankEntities, bankId) => bankEntities[bankId]
);
