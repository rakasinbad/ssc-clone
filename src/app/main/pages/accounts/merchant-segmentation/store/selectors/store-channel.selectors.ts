import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as _ from 'lodash';

import { StoreChannel } from '../../models';
import * as fromStoreSegmentsCore from '../reducers';
import * as fromStoreChannels from '../reducers/store-channel.reducer';

const getStoreSegmentsCoreState = createFeatureSelector<
    fromStoreSegmentsCore.FeatureState,
    fromStoreSegmentsCore.State
>(fromStoreSegmentsCore.featureKey);

export const getStoreChannelEntitiesState = createSelector(
    getStoreSegmentsCoreState,
    state => state.storeChannels
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromStoreChannels.adapter.getSelectors(getStoreChannelEntitiesState);

const getTotalLevelItem = createSelector(getStoreChannelEntitiesState, state => state.deepestLevel);

const getSelectedId = createSelector(getStoreChannelEntitiesState, state => state.selectedId);

const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

const getIsLoading = createSelector(getStoreChannelEntitiesState, state => state.isLoading);

const getIsError = createSelector(getStoreChannelEntitiesState, state => state.isError);

const getIsLoadingRow = createSelector(getStoreChannelEntitiesState, state => state.isLoadingRow);

const getIsRefresh = createSelector(getStoreChannelEntitiesState, state => state.isRefresh);

const getDeactiveItem = createSelector(getStoreChannelEntitiesState, state => state.deactiveItem);

const getChild = (parentId: string) =>
    createSelector(selectAll, state => {
        if (!parentId) {
            return [];
        }

        return _.filter(searchChild(state), ['parentId', parentId]);
    });

const searchChild = (items: Array<StoreChannel>): Array<StoreChannel> => {
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
    getIsError,
    getIsLoadingRow,
    getIsRefresh,
    getDeactiveItem,
    getSelectedId,
    getSelectedItem,
    getTotalLevelItem
};
