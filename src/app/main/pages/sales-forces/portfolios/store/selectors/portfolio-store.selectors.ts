import { createFeatureSelector, createSelector } from '@ngrx/store';

import {
    fromPortfolios,
    mainFeatureKey,
    CoreFeatureState,
    CoreState,
} from '../reducers';

// Get state from the feature key.
export const getPortfolioState = createFeatureSelector<CoreFeatureState, CoreState>(mainFeatureKey);

export const {
    selectAll: selectAllPortfolioStores,
    selectEntities: selectPortfolioStoreEntities,
    selectIds: selectPortfolioStoreIds,
    selectTotal: selectPortfolioStoreTotal
} = fromPortfolios.adapterPortfolioStore.getSelectors();

export const getPortfolioStoreEntity = createSelector(
    getPortfolioState,
    state => state[mainFeatureKey].stores
);

export const getSelectedPortfolioStoreId = createSelector(
    getPortfolioStoreEntity,
    state => state.selectedIds
);

export const getTotalPortfolioStores = createSelector(
    getPortfolioStoreEntity,
    state => state.total
);

export const getAllPortfolioStores = createSelector(
    getPortfolioStoreEntity,
    selectAllPortfolioStores
);

export const getSelectedPortfolioStore = createSelector(
    getPortfolioStoreEntity,
    getSelectedPortfolioStoreId,
    (portfolios, ids) => portfolios[ids[0]]
);

export const getSelectedPortfolioStores = createSelector(
    getPortfolioStoreEntity,
    getSelectedPortfolioStoreId,
    (portfolios, ids) => ids ? ids.map(id => portfolios[id]) : ids
);

export const getLoadingState = createSelector(
    getPortfolioStoreEntity,
    state => state.isLoading
);

export const getNeedRefreshState = createSelector(
    getPortfolioStoreEntity,
    state => state.needRefresh
);
