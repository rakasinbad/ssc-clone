import { createFeatureSelector, createSelector } from '@ngrx/store';

import {
    fromStore,
    featureKey as mainFeatureKey,
    FeatureState as CoreFeatureState,
    State as CoreState,
} from '../reducers';
// import { Store } from 'app/shared/models';

// Get state from the feature key.
export const getPortfolioState = createFeatureSelector<CoreFeatureState, CoreState>(mainFeatureKey);

export const getStoreEntity = createSelector(
    getPortfolioState,
    state => state[fromStore.featureKey]
);

export const {
    selectAll: selectAllStores,
    selectEntities: selectStoreEntities,
    selectIds: selectStoreIds,
    selectTotal: selectStoreTotal
} = fromStore.adapter.getSelectors(getStoreEntity);

// export const getStoreTotalEntity = createSelector(
//     getStoreEntity,
//     selectStoreTotal
// );

export const getTotalStores = createSelector(
    getStoreEntity,
    state => state.total
);

// export const getAllStores = createSelector(
//     getStoreEntity,
//     selectAllStores
// );

export const getLoadingState = createSelector(
    getStoreEntity,
    state => state.isLoading
);

export const getNeedRefreshState = createSelector(
    getStoreEntity,
    state => state.needRefresh
);
