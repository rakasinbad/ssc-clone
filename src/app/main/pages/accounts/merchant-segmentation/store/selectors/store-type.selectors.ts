import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as _ from 'lodash';

import { StoreType } from '../../models';
import * as fromStoreSegmentsCore from '../reducers';
import * as fromStoreTypes from '../reducers/store-type.reducer';

const getStoreSegmentsCoreState = createFeatureSelector<
    fromStoreSegmentsCore.FeatureState,
    fromStoreSegmentsCore.State
>(fromStoreSegmentsCore.featureKey);

export const getStoreTypeEntitiesState = createSelector(
    getStoreSegmentsCoreState,
    state => state.storeTypes
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromStoreTypes.adapter.getSelectors(getStoreTypeEntitiesState);

const getTotalLevelItem = createSelector(getStoreTypeEntitiesState, state => state.deepestLevel);

const getSelectedId = createSelector(getStoreTypeEntitiesState, state => state.selectedId);

const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

const getIsLoading = createSelector(getStoreTypeEntitiesState, state => state.isLoading);

const getIsError = createSelector(getStoreTypeEntitiesState, state => state.isError);

const getIsLoadingRow = createSelector(getStoreTypeEntitiesState, state => state.isLoadingRow);

const getIsRefresh = createSelector(getStoreTypeEntitiesState, state => state.isRefresh);

const getDeactiveItem = createSelector(getStoreTypeEntitiesState, state => state.deactiveItem)

const getChild = (parentId: string) =>
    createSelector(selectAll, state => {
        if (!parentId) {
            return [];
        }

        return _.filter(searchChild(state), ['parentId', parentId]);
    });

const searchChild = (items: Array<StoreType>): Array<StoreType> => {
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
    getIsError,
    getIsLoading,
    getIsLoadingRow,
    getIsRefresh,
    getDeactiveItem,
    getSelectedId,
    getSelectedItem,
    getTotalLevelItem
};
