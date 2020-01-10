import { createFeatureSelector, createSelector } from '@ngrx/store';

import {
    fromPortfolios,
    mainFeatureKey,
    CoreFeatureState,
    CoreState,
} from '../reducers';
import { Portfolio } from '../../models/portfolios.model';

// Get state from the feature key.
export const getPortfolioState = createFeatureSelector<CoreFeatureState, CoreState>(mainFeatureKey);

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

export const getPortfolioEntityType = createSelector(
    getPortfolioEntity,
    state => state.type
);

export const getSelectedPortfolioIds = createSelector(
    getPortfolioEntity,
    state => state.selectedIds
);

export const getSelectedInvoiceGroupId = createSelector(
    getPortfolioEntity,
    state => state.selectedInvoiceGroupId
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
    getSelectedPortfolioIds,
    (portfolios, ids) => (portfolios.entities[ids[0]] as Portfolio)
);

export const getSelectedPortfolios = createSelector(
    getPortfolioEntity,
    getSelectedPortfolioIds,
    (portfolios, ids) => ids.map(id => portfolios.entities[id])
);

export const getLoadingState = createSelector(
    getPortfolioEntity,
    state => state.isLoading
);

export const getNeedRefreshState = createSelector(
    getPortfolioEntity,
    state => state.needRefresh
);
