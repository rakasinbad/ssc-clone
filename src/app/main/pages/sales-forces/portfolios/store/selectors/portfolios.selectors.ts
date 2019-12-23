import { createFeatureSelector, createSelector } from '@ngrx/store';

import {
    fromPortfolios,
    mainFeatureKey,
} from '../reducers';

// Get state from the feature key.
export const getPortfolioState = createFeatureSelector<fromPortfolios.State>(mainFeatureKey);

const getSelectedPortfolioId = createSelector(
    getPortfolioState,
    state => state.selectedIds
);

export const getTotalPortfolios = createSelector(
    getPortfolioState,
    fromPortfolios.selectPortfolioTotal
);

export const getPortfolioEntity = createSelector(
    getPortfolioState,
    fromPortfolios.selectPortfolioEntities
);

export const getSelectedPortfolio = createSelector(
    getPortfolioEntity,
    getSelectedPortfolioId,
    (portfolios, ids) => portfolios[ids[0]]
);

export const getSelectedPortfolios = createSelector(
    getPortfolioEntity,
    getSelectedPortfolioId,
    (portfolios, ids) => ids.map(id => portfolios[id])
);

export const getLoadingState = createSelector(
    getPortfolioState,
    state => state.isLoading
);

export const getNeedRefreshState = createSelector(
    getPortfolioState,
    state => state.needRefresh
);
