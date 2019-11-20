import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromStore } from '../reducers';

export const getStoreState = createFeatureSelector<fromStore.State>(
    fromStore.FEATURE_KEY
);

export const getAllStore = createSelector(
    getStoreState,
    fromStore.selectAllStores
);

export const getSelectedStore = createSelector(
    getStoreState,
    state => state.store
);

export const getStoreEntities = createSelector(
    getStoreState,
    fromStore.selectStoreEntities
);

export const getTotalStoreEntity = createSelector(
    getStoreState,
    fromStore.selectStoresTotal
);

export const getTotalStore = createSelector(
    getStoreState,
    state => state.stores.total
);

export const getGoPage = createSelector(
    getStoreState,
    state => state.goPage
);

export const getIsRefresh = createSelector(
    getStoreState,
    state => state.isRefresh
);

export const getIsLoading = createSelector(
    getStoreState,
    state => state.isLoading
);
