import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromAssociatedStore } from '../reducers';
import * as fromAssociationCore from '../reducers';

const getAssociationsCoreState = createFeatureSelector<
    fromAssociationCore.FeatureState,
    fromAssociationCore.State
>(fromAssociationCore.featureKey);

export const getAssociatedStoreEntitiesState = createSelector(
    getAssociationsCoreState,
    state => state[fromAssociatedStore.featureKey]
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromAssociatedStore.adapter.getSelectors(getAssociatedStoreEntitiesState);

// export const getInitialized = createSelector(getAssociatedStoreEntitiesState, state => state.initialized);

const getTotalItem = createSelector(getAssociatedStoreEntitiesState, state => state.total);

// const getSelectedIds = createSelector(getAssociatedStoreEntitiesState, state => state.selectedIds);

// const getSelectedItem = createSelector(
//     selectEntities,
//     getSelectedIds,
//     (entities, ids) => ids.map(id => entities[id])
// );

const getLoadingState = createSelector(getAssociatedStoreEntitiesState, state => state.isLoading);

export { getLoadingState, getTotalItem };
