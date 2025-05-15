import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromStoreSegmentsCore from '../reducers';
import * as fromMerchantSegmentAlert from '../reducers/merchant-segment-alert.reducer';

const getStoreSegmentsCoreState = createFeatureSelector<
    fromStoreSegmentsCore.FeatureState,
    fromStoreSegmentsCore.State
>(fromStoreSegmentsCore.featureKey);

export const getStoreSegmentAlertEntitiesState = createSelector(
    getStoreSegmentsCoreState,
    state => state.storeSegmentAlert
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromMerchantSegmentAlert.adapter.getSelectors(getStoreSegmentAlertEntitiesState);

const getTotalItem = createSelector(getStoreSegmentAlertEntitiesState, state => state.total);

const getSelectedId = createSelector(getStoreSegmentAlertEntitiesState, state => state.selectedId);

const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

const getIsLoading = createSelector(getStoreSegmentAlertEntitiesState, state => state.isLoading);

const getIsRefresh = createSelector(getStoreSegmentAlertEntitiesState, state => state.isRefresh);

export { getIsLoading, getIsRefresh, getSelectedId, getSelectedItem, getTotalItem };
