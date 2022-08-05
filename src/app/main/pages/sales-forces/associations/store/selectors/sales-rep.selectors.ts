import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromAssociationCore from '../reducers';
import * as fromSalesRep from '../reducers/sales-rep.reducer';

const getAssociationsCoreState = createFeatureSelector<
    fromAssociationCore.FeatureState,
    fromAssociationCore.State
>(fromAssociationCore.featureKey);

export const getAssociationEntitiesState = createSelector(
    getAssociationsCoreState,
    state => state[fromSalesRep.featureKey]
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromSalesRep.adapter.getSelectors(getAssociationEntitiesState);

const getTotalItem = createSelector(getAssociationEntitiesState,
    state => state.total
);

const getSelectedId = createSelector(getAssociationEntitiesState,
    state => state.selectedId
);

const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

const getLoadingState = createSelector(getAssociationEntitiesState,
    state => state.isLoading
);

const getRefreshState = createSelector(getAssociationEntitiesState,
    state => state.isRefresh
);

export {
    getLoadingState,
    getRefreshState,
    getSelectedId,
    getSelectedItem,
    getTotalItem
};
