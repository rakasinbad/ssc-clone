import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromMerchant } from '../reducers';

const getAccountStoreState = createFeatureSelector<fromMerchant.State>(fromMerchant.FEATURE_KEY);

// -----------------------------------------------------------------------------------------------------
// Store Setting State
// -----------------------------------------------------------------------------------------------------

export const getAllStoreSetting = createSelector(getAccountStoreState, fromMerchant.selectAllStoreSetting);

export const getStoreEntities = createSelector(
    getAccountStoreState,
    fromMerchant.selectStoreSettingEntities
);

export const getStoreSettingIds = createSelector(getAccountStoreState, fromMerchant.selectStoreSettingIds);

export const getTotalStoreSettingEntity = createSelector(
    getAccountStoreState,
    fromMerchant.selectStoreSettingTotal
);

export const getTotalStoreSetting = createSelector(getAccountStoreState, state => state.settings.total);

export const getSelectedStoreSettingId = createSelector(
    getAccountStoreState,
    state => state.settings.selectedId
);

export const getSelectedStoreSetting = createSelector(
    getStoreEntities,
    getSelectedStoreSettingId,
    (entities, id) => entities[id]
);
