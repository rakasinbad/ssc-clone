import { createFeatureSelector, createSelector } from '@ngrx/store';
import { fromSource } from 'app/shared/store/reducers';

import * as fromTempteratures from '../../../reducers/sources/temperature/temperature.reducer';

const getSourcesCoreState = createFeatureSelector<fromSource.FeatureState, fromSource.State>(
    fromSource.featureKey
);

const getTemperaturesCoreState = createSelector(getSourcesCoreState, state => state.temperatures);

export const getTemperatureEntitiesState = createSelector(
    getTemperaturesCoreState,
    state => state.temperatures
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromTempteratures.adapter.getSelectors(getTemperatureEntitiesState);

const getTotalItem = createSelector(getTemperatureEntitiesState, state => state.total);

const getSelectedId = createSelector(getTemperatureEntitiesState, state => state.selectedId);

const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

const getIsLoading = createSelector(getTemperatureEntitiesState, state => state.isLoading);

export { getIsLoading, getSelectedId, getSelectedItem, getTotalItem };
