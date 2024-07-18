import { createFeatureSelector, createSelector } from '@ngrx/store';

import { teritory } from '../reducers';

export const getTeritoryState = createFeatureSelector<teritory.State>(teritory.FEATURE_KEY);

// -----------------------------------------------------------------------------------------------------
// Regions State
// -----------------------------------------------------------------------------------------------------

export const getAllRegionsTeritory = createSelector(getTeritoryState, teritory.selectAllRegions);

export const getRegionsTeritoryEntities = createSelector(
    getTeritoryState,
    teritory.selectRegionsEntities
);

export const getRegionsTeritoryIds = createSelector(getTeritoryState, teritory.selectRegionsIds);

export const getTotalRegionsTeritoryEntity = createSelector(
    getTeritoryState,
    teritory.selectRegionsTotal
);

export const getTotalRegionsTeritory = createSelector(
    getTeritoryState,
    (state) => state.regions.total
);

export const getRegionsPaginateTeritory = createSelector(
    getTeritoryState,
    (state) => state.regionPaginate
);

// -----------------------------------------------------------------------------------------------------
// Branches State
// -----------------------------------------------------------------------------------------------------

export const getAllBranchesTeritory = createSelector(getTeritoryState, teritory.selectAllBranches);

export const getBranchesTeritoryEntities = createSelector(
    getTeritoryState,
    teritory.selectBranchesEntities
);

export const getBranchesTeritoryIds = createSelector(getTeritoryState, teritory.selectBranchesIds);

export const getTotalBranchesTeritoryEntity = createSelector(
    getTeritoryState,
    teritory.selectBranchesTotal
);

export const getTotalBranchesTeritory = createSelector(
    getTeritoryState,
    (state) => state.branches.total
);

export const getBranchesPaginateTeritory = createSelector(
    getTeritoryState,
    (state) => state.branchPaginate
);

// -----------------------------------------------------------------------------------------------------
// Warehouses State
// -----------------------------------------------------------------------------------------------------

export const getAllWarehousesTeritory = createSelector(
    getTeritoryState,
    teritory.selectAllWarehouses
);

export const getWarehousesTeritoryEntities = createSelector(
    getTeritoryState,
    teritory.selectWarehousesEntities
);

export const getWarehousesTeritoryIds = createSelector(
    getTeritoryState,
    teritory.selectWarehousesIds
);

export const getTotalWarehousesTeritoryEntity = createSelector(
    getTeritoryState,
    teritory.selectWarehousesTotal
);

export const getTotalWarehousesTeritory = createSelector(
    getTeritoryState,
    (state) => state.warehouses.total
);

export const getWarehousesPaginateTeritory = createSelector(
    getTeritoryState,
    (state) => state.warehouses.meta
);

// -----------------------------------------------------------------------------------------------------
// Teritory State
// -----------------------------------------------------------------------------------------------------

export const getRegionsTeritory = createSelector(getTeritoryState, (state) => state.regions);

export const getBranchesTeritory = createSelector(getTeritoryState, (state) => state.branches);

export const getWarehousesTeritory = createSelector(getTeritoryState, (state) => state.warehouses);

// -----------------------------------------------------------------------------------------------------
// Helper State
// -----------------------------------------------------------------------------------------------------

export const getTeritoryIsLoading = createSelector(getTeritoryState, (state) => state.isLoading);

export const getSelectedWarehouse = createSelector(getTeritoryState, (state) => {
    return state.selectedWarehouse;
});
