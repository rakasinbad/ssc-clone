import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromSkpCore from '../reducers';
import * as fromSkpCombos from '../reducers/skp.reducer';

export const getSkpCoreState = createFeatureSelector<
fromSkpCore.FeatureState,
fromSkpCore.State
>(fromSkpCore.featureKey);

export const getSkpEntitiesState = createSelector(
    getSkpCoreState,
    (state) => state.SkpCombos
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal,
} = fromSkpCombos.adapter.getSelectors(getSkpEntitiesState);

export const getTotalItem = createSelector(getSkpEntitiesState, (state) => state.total);

export const getSelectedId = createSelector(
    getSkpEntitiesState,
    (state) => state.selectedId
);

export const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

export const getIsLoading = createSelector(getSkpEntitiesState, (state) => state.isLoading);
