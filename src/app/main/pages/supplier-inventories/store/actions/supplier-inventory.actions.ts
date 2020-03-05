import { createAction, props } from '@ngrx/store';
import { IErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

// -----------------------------------------------------------------------------------------------------
// Fetch Supplier Inventories
// -----------------------------------------------------------------------------------------------------

export const fetchSupplierInventoriesRequest = createAction(
    '[Supplier Inventories API] Fetch Supplier Inventories Request',
    props<{ payload: IQueryParams }>()
);

export const fetchSupplierInventoriesFailure = createAction(
    '[Supplier Inventories API] Fetch Supplier Inventories Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchSupplierInventoriesSuccess = createAction(
    '[Supplier Inventories API] Fetch Supplier Inventories Success',
    props<{ payload: { data: any; total: number } }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Supplier Inventory
// -----------------------------------------------------------------------------------------------------

export const fetchSupplierInventoryRequest = createAction(
    '[Supplier Inventory API] Fetch Supplier Inventory Request',
    props<{ payload: string }>()
);

export const fetchSupplierInventoryFailure = createAction(
    '[Supplier Inventory API] Fetch Supplier Inventory Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchSupplierInventorySuccess = createAction(
    '[Supplier Inventory API] Fetch Supplier Inventory Success',
    props<{ payload: any }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - UPDATE SUPPLIER INVENTORY] Supplier Inventory
// -----------------------------------------------------------------------------------------------------

export const updateSupplierInventoryRequest = createAction(
    '[Supplier Inventory API] Update Supplier Inventory Request',
    props<{ payload: { body: any; id: string } }>()
);

export const updateSupplierInventoryFailure = createAction(
    '[Supplier Inventory API] Update Supplier Inventory Failure',
    props<{ payload: IErrorHandler }>()
);

export const updateSupplierInventorySuccess = createAction(
    '[Supplier Inventory API] Update Supplier Inventory Success',
    props<{ payload: any }>()
);

// -----------------------------------------------------------------------------------------------------
// Reset Actions
// -----------------------------------------------------------------------------------------------------

export const resetSupplierInventories = createAction(
    '[Supplier Inventories Page] Reset Supplier Inventories State'
);
