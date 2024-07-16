import { createFeatureSelector, createSelector } from '@ngrx/store';
import { fromSource } from 'app/shared/store/reducers';

import * as fromRegion from '../../../reducers/sources/region/region.reducer';

const getSourcesCoreState = createFeatureSelector<fromSource.FeatureState, fromSource.State>(
    fromSource.featureKey
);

const getRegionCoreState = createSelector(getSourcesCoreState, state => state.region);

export const getRegionEntitiesState = createSelector(
  getRegionCoreState,
    state => state.region
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = fromRegion.adapter.getSelectors(getRegionEntitiesState);

const getTotalItem = createSelector(getRegionEntitiesState, state => state.total);

const getSelectedId = createSelector(getRegionEntitiesState, state => state.selectedId);

const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

const getIsLoading = createSelector(getRegionEntitiesState, state => state.isLoading);

export { getIsLoading, getSelectedId, getSelectedItem, getTotalItem };
