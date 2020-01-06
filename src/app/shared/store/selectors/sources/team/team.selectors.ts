import { createFeatureSelector, createSelector } from '@ngrx/store';
import { fromSource } from 'app/shared/store/reducers';

import * as fromTeams from '../../../reducers/sources/team/team.reducer';

const getSourcesCoreState = createFeatureSelector<fromSource.FeatureState, fromSource.State>(
    fromSource.featureKey
);

const getTeamsCoreState = createSelector(getSourcesCoreState, state => state.teams);

export const getTeamEntitiesState = createSelector(getTeamsCoreState, state => state.teams);

export const { selectAll, selectEntities, selectIds, selectTotal } = fromTeams.adapter.getSelectors(
    getTeamEntitiesState
);

const getTotalItem = createSelector(getTeamEntitiesState, state => state.total);

const getSelectedId = createSelector(getTeamEntitiesState, state => state.selectedId);

const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

const getIsLoading = createSelector(getTeamEntitiesState, state => state.isLoading);

export { getIsLoading, getSelectedId, getSelectedItem, getTotalItem };
