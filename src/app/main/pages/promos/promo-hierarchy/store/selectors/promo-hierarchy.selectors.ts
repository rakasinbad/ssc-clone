import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromPromoHierarchyCore from '../reducers';
import * as fromPromoHierarchy from '../reducers/promo-hierarchy.reducer';

export const getPromoHierarchyCoreState = createFeatureSelector<
    fromPromoHierarchyCore.FeatureState,
    fromPromoHierarchyCore.State
>(fromPromoHierarchyCore.featureKey);

export const getPromoHierarchyEntitiesState = createSelector(
    getPromoHierarchyCoreState,
    (state) => state.promoHierarchys
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal,
} = fromPromoHierarchy.adapter.getSelectors(getPromoHierarchyEntitiesState);

export const getTotalItem = createSelector(getPromoHierarchyEntitiesState, (state) => state.total);

export const getSelectedId = createSelector(
    getPromoHierarchyEntitiesState,
    (state) => state.selectedId
);

export const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

export const getLoadingState = createSelector(
    getPromoHierarchyEntitiesState,
    (state) => state.isLoading
);
