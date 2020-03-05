import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromAssociationCore from '../reducers';

const getAssociationsCoreState = createFeatureSelector<
    fromAssociationCore.FeatureState,
    fromAssociationCore.State
>(fromAssociationCore.featureKey);

export const getAssociatedPortfolioEntitiesState = createSelector(
    getAssociationsCoreState,
    state => state.portfolios
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromAssociationCore.fromAssociatedPortfolio.adapter.getSelectors(
    getAssociatedPortfolioEntitiesState
);

export const getInitialized = createSelector(
    getAssociatedPortfolioEntitiesState,
    state => state.initialized
);

const getTotalItem = createSelector(getAssociatedPortfolioEntitiesState, state => state.total);

const getSelectedIds = createSelector(
    getAssociatedPortfolioEntitiesState,
    state => state.selectedIds
);

const getSelectedItem = createSelector(selectEntities, getSelectedIds, (entities, ids) =>
    ids.map(id => entities[id])
);

const getLoadingState = createSelector(
    getAssociatedPortfolioEntitiesState,
    state => state.isLoading
);

export { getLoadingState, getSelectedIds, getSelectedItem, getTotalItem };
