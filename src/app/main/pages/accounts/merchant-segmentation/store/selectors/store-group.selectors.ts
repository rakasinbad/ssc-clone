import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as _ from 'lodash';

import { StoreGroup } from '../../models';
import * as fromStoreSegmentsCore from '../reducers';
import * as fromStoreGroups from '../reducers/store-group.reducer';

const getStoreSegmentsCoreState = createFeatureSelector<
    fromStoreSegmentsCore.FeatureState,
    fromStoreSegmentsCore.State
>(fromStoreSegmentsCore.featureKey);

export const getStoreGroupEntitiesState = createSelector(
    getStoreSegmentsCoreState,
    state => state.storeGroups
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromStoreGroups.adapter.getSelectors(getStoreGroupEntitiesState);

const getTotalLevelItem = createSelector(getStoreGroupEntitiesState, state => state.deepestLevel);

const getSelectedId = createSelector(getStoreGroupEntitiesState, state => state.selectedId);

const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

const getIsLoading = createSelector(getStoreGroupEntitiesState, state => state.isLoading);

const getIsLoadingRow = createSelector(getStoreGroupEntitiesState, state => state.isLoadingRow);

const getIsRefresh = createSelector(getStoreGroupEntitiesState, state => state.isRefresh);

const getChild = (parentId: string) =>
    createSelector(selectAll, state => {
        if (!parentId) {
            return [];
        }

        return _.filter(searchChild(state), ['parentId', parentId]);
    });

const searchChild = (items: Array<StoreGroup>): Array<StoreGroup> => {
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
