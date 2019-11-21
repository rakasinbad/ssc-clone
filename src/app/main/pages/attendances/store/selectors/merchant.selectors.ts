import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromMerchant } from '../reducers';

export const getMerchantState = createFeatureSelector<fromMerchant.State>(
    fromMerchant.FEATURE_KEY
);

export const getAllMerchant = createSelector(
    getMerchantState,
    fromMerchant.selectAllMerchants
);

export const getMerchantEntities = createSelector(
    getMerchantState,
    fromMerchant.selectMerchantEntities
);

export const getTotalMerchant = createSelector(
    getMerchantState,
    state => state.merchants.total
);

export const getSelectedMerchantId = createSelector(
    getMerchantState,
    state => state.selectedMerchantId
);

export const getSourceType = createSelector(
    getMerchantState,
    state => state.source
);

export const getMerchant = createSelector(
    getMerchantState,
    state => state.merchant
);

export const getSelectedMerchant = createSelector(
    getMerchantEntities,
    getSelectedMerchantId,
    getSourceType,
    getMerchant,
    (merchantEntities, merchantId, sourceType, merchant) =>
        sourceType === 'fetch' ? merchant : merchantEntities[merchantId]
);

export const getAllMerchantSource = createSelector(
    getAllMerchant,
    getTotalMerchant,
    (allMerchant, totalMerchant) => {
        return {
            data: allMerchant,
            total: totalMerchant
        };
    }
);

export const getIsDeleting = createSelector(
    getMerchantState,
    state => state.isDeleting
);

export const getIsLoading = createSelector(
    getMerchantState,
    state => state.isLoading
);
