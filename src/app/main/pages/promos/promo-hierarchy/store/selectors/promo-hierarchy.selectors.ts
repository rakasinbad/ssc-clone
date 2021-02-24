import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromPromoHierarchyCore from '../reducers';
import * as fromPromoHierarchy from '../reducers/promo-hierarchy.reducer';

// Get state from the feature key.
// export const getPromoHierarchyCoreState = createFeatureSelector<
//     fromPromoHierarchyCore.FeatureState,
//     fromPromoHierarchyCore.State
// >(fromPromoHierarchyCore.featureKey);

export const getPromoHierarchyCoreState = createFeatureSelector<
fromPromoHierarchyCore.FeatureState,
fromPromoHierarchyCore.State
>(fromPromoHierarchyCore.featureKey);

export const getPromoHierarchyEntitiesState = createSelector(
    getPromoHierarchyCoreState,
    (state) => state.promoHierarchy
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal,
} = fromPromoHierarchy.adapter.getSelectors(getPromoHierarchyEntitiesState);

const getPromoHierarchyState = createSelector(
    getPromoHierarchyCoreState,
    (state) => state[fromPromoHierarchy.featureKey]
);

export const getTotalItem = createSelector(getPromoHierarchyState, (state) => state.total);

export const getSelectedId = createSelector(
    getPromoHierarchyEntitiesState,
    (state) => state.selectedId
);

export const getSelectedItem = createSelector(
    getPromoHierarchyState,
    getSelectedId,
    (entities, id) => entities[id]
);

export const getLoadingState = createSelector(getPromoHierarchyState, (state) => state.isLoading);

export const getRefreshStatus = createSelector(getPromoHierarchyState, (state) => state.needRefresh);
