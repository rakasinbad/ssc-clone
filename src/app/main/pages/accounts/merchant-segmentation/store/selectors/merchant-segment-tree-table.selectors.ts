import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromStoreSegmentsCore from '../reducers';
import * as fromMerchantSegmentTreeTable from '../reducers/merchant-segment-tree-table.reducer';

const getStoreSegmentsCoreState = createFeatureSelector<
    fromStoreSegmentsCore.FeatureState,
    fromStoreSegmentsCore.State
>(fromStoreSegmentsCore.featureKey);

export const getStoreSegmentTreeTableEntitiesState = createSelector(
    getStoreSegmentsCoreState,
    state => state.storeSegmentTreeTable
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromMerchantSegmentTreeTable.adapter.getSelectors(getStoreSegmentTreeTableEntitiesState);

const getTotalItem = createSelector(getStoreSegmentTreeTableEntitiesState, state => state.total);

const getSelectedId = createSelector(
    getStoreSegmentTreeTableEntitiesState,
    state => state.selectedId
);

const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

const getIsLoading = createSelector(
    getStoreSegmentTreeTableEntitiesState,
    state => state.isLoading
);

const getIsRefresh = createSelector(
    getStoreSegmentTreeTableEntitiesState,
    state => state.isRefresh
);

export { getIsLoading, getIsRefresh, getSelectedId, getSelectedItem, getTotalItem };
