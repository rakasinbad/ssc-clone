import { createFeatureSelector, createSelector } from '@ngrx/store';

import {
    fromStore,
    mainFeatureKey,
    CoreFeatureState,
    CoreState,
} from '../reducers';
import { Store } from 'app/main/pages/attendances/models';

// Get state from the feature key.
export const getPortfolioState = createFeatureSelector<CoreFeatureState, CoreState>(mainFeatureKey);

export const {
    selectAll: selectAllStores,
    selectEntities: selectStoreEntities,
    selectIds: selectStoreIds,
    selectTotal: selectStoreTotal
} = fromStore.adapter.getSelectors();

export const getStoreEntity = createSelector(
    getPortfolioState,
    state => state[fromStore.featureKey]
);

export const getSelectedStoreIds = createSelector(
    getStoreEntity,
    state => state.selectedIds
);

export const getTotalStores = createSelector(
    getStoreEntity,
    state => state.total
);

export const getAllStores = createSelector(
    getStoreEntity,
    selectAllStores
);

export const getSelectedStore = createSelector(
    getStoreEntity,
    getSelectedStoreIds,
    (stores, ids) => (stores[ids[0]] as Store)
);

export const getSelectedStores = createSelector(
    getStoreEntity,
    getSelectedStoreIds,
    (stores, ids) => ids ? ids.map(id => stores[id]) : ids
);

export const getLoadingState = createSelector(
    getStoreEntity,
    state => state.isLoading
);

export const getNeedRefreshState = createSelector(
    getStoreEntity,
    state => state.needRefresh
);
