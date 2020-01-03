import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromAssociation from '../reducers/association.reducer';
import * as fromAssociationCore from '../reducers';

const getAssociationsCoreState = createFeatureSelector<
    fromAssociationCore.FeatureState,
    fromAssociationCore.State
>(fromAssociationCore.featureKey);

export const getAssociationEntitiesState = createSelector(
    getAssociationsCoreState,
    state => state.associations
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromAssociation.adapter.getSelectors(getAssociationEntitiesState);

const getTotalItem = createSelector(getAssociationEntitiesState, state => state.total);

const getSelectedId = createSelector(getAssociationEntitiesState, state => state.selectedId);

const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

const getIsLoading = createSelector(getAssociationEntitiesState, state => state.isLoading);

export { getIsLoading, getSelectedId, getSelectedItem, getTotalItem };