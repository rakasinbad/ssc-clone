import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromFlexiComboList from '../reducers/flexi-combo-list.reducer';
import * as fromFlexiCombo from '../reducers';

const getAssociationCoreState = createFeatureSelector<
    fromFlexiCombo.FeatureState,
    fromFlexiCombo.State
>(fromFlexiCombo.featureKey);

export const getFlexiComboListEntitiesState = createSelector(
    getAssociationCoreState,
    state => state.flexiComboList
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromFlexiComboList.adapter.getSelectors(getFlexiComboListEntitiesState);

const getTotalItem = createSelector(getFlexiComboListEntitiesState, state => state.total);

const getSelectedId = createSelector(getFlexiComboListEntitiesState, state => state.selectedId);

const getSearchValue = createSelector(getFlexiComboListEntitiesState, state => state.textSearch);

const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

const getLoadingState = createSelector(getFlexiComboListEntitiesState, state => state.isLoading);

export { getLoadingState, getSelectedId, getSelectedItem, getTotalItem, getSearchValue };
