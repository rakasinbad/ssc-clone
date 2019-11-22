import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromSupplierInventory } from '../reducers';

export const getSupplierInventoryState = createFeatureSelector<fromSupplierInventory.State>(
    fromSupplierInventory.FEATURE_KEY
);

// -----------------------------------------------------------------------------------------------------
// Supplier Inventories State
// -----------------------------------------------------------------------------------------------------

export const getAllSupplierInventory = createSelector(
    getSupplierInventoryState,
    fromSupplierInventory.selectAllSupplierInventory
);

export const getSupplierInventoryEntities = createSelector(
    getSupplierInventoryState,
    fromSupplierInventory.selectSupplierInventoryEntities
);

export const getTotalSupplierInventorEntity = createSelector(
    getSupplierInventoryState,
    fromSupplierInventory.selectSupplierInventoryTotal
);

export const getTotalSupplierInventory = createSelector(
    getSupplierInventoryState,
    state => state.supplierInventories.total
);

export const getSelectedSupplierInventoryId = createSelector(
    getSupplierInventoryState,
    state => state.supplierInventories.selectedSupplierInventoryId
);

export const getSelectedSupplierInventory = createSelector(
    getSupplierInventoryEntities,
    getSelectedSupplierInventoryId,
    (entities, id) => entities[id]
);

// -----------------------------------------------------------------------------------------------------
// Helper State
// -----------------------------------------------------------------------------------------------------

export const getIsRefresh = createSelector(getSupplierInventoryState, state => state.isRefresh);

export const getIsLoading = createSelector(getSupplierInventoryState, state => state.isLoading);
