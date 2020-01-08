import { createFeatureSelector, createSelector } from '@ngrx/store';
import { fromSource } from 'app/shared/store/reducers';

import * as fromPortfolios from '../../../reducers/sources/portfolio/portfolio.reducer';

const getSourcesCoreState = createFeatureSelector<fromSource.FeatureState, fromSource.State>(
    fromSource.featureKey
);

const getPortfoliosCoreState = createSelector(getSourcesCoreState, state => state.portfolios);

export const getPortfolioEntitiesState = createSelector(
    getPortfoliosCoreState,
    state => state.portfolios
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromPortfolios.adapter.getSelectors(getPortfolioEntitiesState);

const getTotalItem = createSelector(getPortfolioEntitiesState, state => state.total);

const getSelectedId = createSelector(getPortfolioEntitiesState, state => state.selectedId);

const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

const getIsLoading = createSelector(getPortfolioEntitiesState, state => state.isLoading);

export { getIsLoading, getSelectedId, getSelectedItem, getTotalItem };
