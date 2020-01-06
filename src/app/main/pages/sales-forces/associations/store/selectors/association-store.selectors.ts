import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromAssociationStore from '../reducers/association-store.reducer';
import * as fromAssociationCore from '../reducers';

const getAssociationsCoreState = createFeatureSelector<
    fromAssociationCore.FeatureState,
    fromAssociationCore.State
>(fromAssociationCore.featureKey);

export const getAssociationEntitiesState = createSelector(
    getAssociationsCoreState,
    state => state.associationStores
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromAssociationStore.adapter.getSelectors(getAssociationEntitiesState);

const getTotalItem = createSelector(getAssociationEntitiesState, state => state.total);

const getSelectedId = createSelector(getAssociationEntitiesState, state => state.selectedId);

const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

const getIsLoading = createSelector(getAssociationEntitiesState, state => state.isLoading);

export { getIsLoading, getSelectedId, getSelectedItem, getTotalItem };
