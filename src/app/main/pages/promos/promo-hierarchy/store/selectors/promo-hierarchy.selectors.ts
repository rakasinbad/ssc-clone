import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromPromoHierarchyCore from '../reducers';
import { fromPromoHierarchy } from '../reducers';

// Get state from the feature key.
export const getPromoHierarchyCoreState = createFeatureSelector<
    fromPromoHierarchyCore.FeatureState,
    fromPromoHierarchyCore.State
>(fromPromoHierarchyCore.featureKey);

export const {
    selectAll: selectAllPromoHierarchy,
    selectEntities: selectPromoHierarchyEntities,
    selectIds: selectPromoHierarchyIds,
    selectTotal: selectPromoHierarchyTotal,
} = fromPromoHierarchyCore.fromPromoHierarchy.adapterPromoHierarchy.getSelectors();

const getPromoHierarchyState = createSelector(
    getPromoHierarchyCoreState,
    (state) => state[fromPromoHierarchy.FEATURE_KEY]
);

export const getPromoHierarchyEntity = createSelector(getPromoHierarchyState, selectPromoHierarchyEntities);

export const getPromoHierarchyTotalEntity = createSelector(getPromoHierarchyState, selectPromoHierarchyTotal);

export const getAllPromoHierarchy = createSelector(getPromoHierarchyState, selectAllPromoHierarchy);

export const getPromoHierarchyIds = createSelector(getPromoHierarchyState, selectPromoHierarchyIds);

export const getTotalItem = createSelector(getPromoHierarchyState, (state) => state.total);

export const getSelectedVoucher = createSelector(
    getPromoHierarchyState,
    getPromoHierarchyEntity,
    (state, Voucher) => Voucher[state.selectedId]
);

export const getLoadingState = createSelector(getPromoHierarchyState, (state) => state.isLoading);

export const getRefreshStatus = createSelector(getPromoHierarchyState, (state) => state.needRefresh);
