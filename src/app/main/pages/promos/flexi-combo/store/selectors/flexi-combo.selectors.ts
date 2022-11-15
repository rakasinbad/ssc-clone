import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromFlexiComboCore from '../reducers';
import * as fromFlexiCombos from '../reducers/flexi-combo.reducer';

export const getFlexiComboCoreState = createFeatureSelector<
    fromFlexiComboCore.FeatureState,
    fromFlexiComboCore.State
>(fromFlexiComboCore.featureKey);

export const getFlexiComboEntitiesState = createSelector(
    getFlexiComboCoreState,
    (state) => state.flexiCombos
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal,
} = fromFlexiCombos.adapter.getSelectors(getFlexiComboEntitiesState);

export const getTotalItem = createSelector(getFlexiComboEntitiesState, (state) => state.total);

export const getSelectedId = createSelector(
    getFlexiComboEntitiesState,
    (state) => state.selectedId
);

export const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

export const getIsLoading = createSelector(getFlexiComboEntitiesState, (state) => state.isLoading);
