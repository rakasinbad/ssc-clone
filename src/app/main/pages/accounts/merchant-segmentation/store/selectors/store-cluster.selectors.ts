import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as _ from 'lodash';

import { StoreCluster } from '../../models';
import * as fromStoreSegmentsCore from '../reducers';
import * as fromStoreClusters from '../reducers/store-cluster.reducer';

const getStoreSegmentsCoreState = createFeatureSelector<
    fromStoreSegmentsCore.FeatureState,
    fromStoreSegmentsCore.State
>(fromStoreSegmentsCore.featureKey);

export const getStoreClusterEntitiesState = createSelector(
    getStoreSegmentsCoreState,
    state => state.storeClusters
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromStoreClusters.adapter.getSelectors(getStoreClusterEntitiesState);

const getTotalLevelItem = createSelector(getStoreClusterEntitiesState, state => state.deepestLevel);

const getSelectedId = createSelector(getStoreClusterEntitiesState, state => state.selectedId);

const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

const getIsLoading = createSelector(getStoreClusterEntitiesState, state => state.isLoading);

const getIsLoadingRow = createSelector(getStoreClusterEntitiesState, state => state.isLoadingRow);

const getIsRefresh = createSelector(getStoreClusterEntitiesState, state => state.isRefresh);

const getChild = (parentId: string) =>
    createSelector(selectAll, state => {
        if (!parentId) {
            return [];
        }

        return _.filter(searchChild(state), ['parentId', parentId]);
    });

const searchChild = (items: Array<StoreCluster>): Array<StoreCluster> => {
    return items.reduce((flatItems, item) => {
        flatItems.push(item);

        if (item.hasChild && Array.isArray(item.children)) {
            flatItems = flatItems.concat(searchChild(item.children));
        }

        return flatItems;
    }, []);
};

export {
    getChild,
    getIsLoading,
    getIsLoadingRow,
    getIsRefresh,
    getSelectedId,
    getSelectedItem,
    getTotalLevelItem
};
