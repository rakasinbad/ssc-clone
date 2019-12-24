import { createFeatureSelector, createSelector } from '@ngrx/store';

import {
    fromPortfolios,
    mainFeatureKey,
    FeatureState,
    State as CoreState
} from '../reducers';

// Get state from the feature key.
export const getPortfolioState = createFeatureSelector<FeatureState, CoreState>(mainFeatureKey);

export const {
    selectAll: selectAllPortfolios,
    selectEntities: selectPortfolioEntities,
    selectIds: selectPortfolioIds,
    selectTotal: selectPortfolioTotal
} = fromPortfolios.adapter.getSelectors();

export const getPortfolioEntity = createSelector(
    getPortfolioState,
    state => state[mainFeatureKey]
);

export const getSelectedPortfolioId = createSelector(
    getPortfolioEntity,
    state => state.selectedIds
);

export const getTotalPortfolios = createSelector(
    getPortfolioEntity,
    state => state.total
);

export const getAllPortfolios = createSelector(
    getPortfolioEntity,
    selectAllPortfolios
);

export const getSelectedPortfolio = createSelector(
    getPortfolioEntity,
    getSelectedPortfolioId,
    (portfolios, ids) => portfolios[ids[0]]
);

export const getSelectedPortfolios = createSelector(
    getPortfolioEntity,
    getSelectedPortfolioId,
    (portfolios, ids) => ids ? ids.map(id => portfolios[id]) : ids
);

export const getLoadingState = createSelector(
    getPortfolioEntity,
    state => state.isLoading
);

export const getNeedRefreshState = createSelector(
    getPortfolioEntity,
    state => state.needRefresh
);
