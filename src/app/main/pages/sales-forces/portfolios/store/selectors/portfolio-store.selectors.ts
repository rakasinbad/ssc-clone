import { createFeatureSelector, createSelector } from '@ngrx/store';

import {
    fromPortfolios,
    mainFeatureKey,
    CoreFeatureState,
    CoreState,
} from '../reducers';
import { Store } from '../../models';
import { TNullable } from 'app/shared/models';

// Get state from the feature key.
export const getPortfolioState = createFeatureSelector<CoreFeatureState, CoreState>(mainFeatureKey);

export const {
    selectAll: selectAllPortfolioStores,
    selectEntities: selectPortfolioStoreEntities,
    selectIds: selectPortfolioStoreIds,
    selectTotal: selectPortfolioStoreTotal
} = fromPortfolios.adapterPortfolioStore.getSelectors();

export const {
    selectAll: selectAllPortfolioNewStores,
    selectEntities: selectPortfolioNewStoreEntities,
    selectIds: selectPortfolioNewStoreIds,
    selectTotal: selectPortfolioNewStoreTotal
} = fromPortfolios.adapterPortfolioNewStore.getSelectors();

export const getPortfolioStoreEntity = createSelector(
    getPortfolioState,
    state => state[mainFeatureKey].stores
);

export const getPortfolioNewStoreEntity = createSelector(
    getPortfolioState,
    state => state[mainFeatureKey].newStores
);

export const getPortfolioStoreEntityIds = createSelector(
    getPortfolioStoreEntity,
    selectPortfolioStoreIds
);

export const getTotalPortfolioStoreEntity = createSelector(
    getPortfolioStoreEntity,
    selectPortfolioStoreTotal
);

export const getTotalPortfolioStores = createSelector(
    getPortfolioStoreEntity,
    state => state.total
);

export const getAllPortfolioStores = createSelector(
    getPortfolioStoreEntity,
    selectAllPortfolioStores
);


export const getLoadingState = createSelector(
    getPortfolioStoreEntity,
    state => state.isLoading
);

export const getNeedRefreshState = createSelector(
    getPortfolioStoreEntity,
    state => state.needRefresh
);

export const getPortfolioNewStoreIds = createSelector(
    getPortfolioNewStoreEntity,
    selectPortfolioNewStoreIds
);

export const getPortfolioNewStore = createSelector(
    getPortfolioNewStoreEntity,
    getPortfolioNewStoreIds,
    (portfolios, ids) => (portfolios[ids[0]] as TNullable<Store>)
);

export const getPortfolioNewStores = createSelector(
    getPortfolioNewStoreEntity,
    selectAllPortfolioNewStores,
);

export const getTotalPortfolioNewStoreEntity = createSelector(
    getPortfolioNewStoreEntity,
    selectPortfolioNewStoreTotal
)
