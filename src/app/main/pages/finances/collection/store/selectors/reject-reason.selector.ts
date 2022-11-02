import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromCollectionCore from '../reducers';
import * as fromCollection from '../reducers/collection.reducer';
import * as fromRejectReasonCore from '../reducers';
import * as fromRejectReason from '../reducers/reject-reason.reducer';


export const getRejectReasonCoreState = createFeatureSelector<
fromRejectReasonCore.FeatureState,
fromRejectReasonCore.State
>(fromRejectReasonCore.featureKey);

export const getRejectReasonEntitiesState = createSelector(
    getRejectReasonCoreState,
    (state) => state.collectionRejectReason
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal,
} = fromRejectReason.adapter.getSelectors(getRejectReasonEntitiesState);

// export const getTotalItem = createSelector(getRejectReasonEntitiesState, (state) => state.total);

export const getSelectedId = createSelector(
    getRejectReasonEntitiesState,
    (state) => state
);

// export const getSelectedItem = createSelector(
//     selectEntities,
//     getSelectedId,
//     (entities, id) => entities[id]
// );

export const getLoadingState = createSelector(
    getRejectReasonEntitiesState,
    (state) => state.isLoading
);

