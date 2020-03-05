import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { PayloadWarehouseConfirmation } from 'app/shared/models/warehouse-confirmation.model';

import { Warehouse } from '../../models';

// -----------------------------------------------------------------------------------------------------
// Fetch Warehouses
// -----------------------------------------------------------------------------------------------------

export const fetchWarehousesRequest = createAction(
    '[Warehouses] Fetch Warehouses Request',
    props<{ payload: IQueryParams }>()
);

export const fetchWarehousesFailure = createAction(
    '[Warehouses] Fetch Warehouses Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchWarehousesSuccess = createAction(
    '[Warehouses] Fetch Warehouses Success',
    props<{ payload: { data: Array<Warehouse>; total: number } }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Warehouse
// -----------------------------------------------------------------------------------------------------

export const fetchWarehouseRequest = createAction(
    '[Warehouse] Fetch Warehouse Request',
    props<{ payload: string }>()
);

export const fetchWarehouseFailure = createAction(
    '[Warehouse] Fetch Warehouse Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchWarehouseSuccess = createAction(
    '[Warehouse] Fetch Warehouse Success',
    props<{ payload: Warehouse }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - CREATE] Warehouse
// -----------------------------------------------------------------------------------------------------

export const createWarehouseRequest = createAction(
    '[Warehouses] Create Warehouse Request',
    props<{ payload: any }>()
);

export const createWarehouseFailure = createAction(
    '[Warehouses] Create Warehouse Failure',
    props<{ payload: ErrorHandler }>()
);

export const createWarehouseSuccess = createAction('[Warehouses] Create Warehouse Success');

// -----------------------------------------------------------------------------------------------------
// [CRUD - UPDATE] Warehouse
// -----------------------------------------------------------------------------------------------------

export const updateWarehouseRequest = createAction(
    '[Warehouses] Update Warehouse Request',
    props<{ payload: { body: any; id: string } }>()
);

export const updateWarehouseFailure = createAction(
    '[Warehouses] Update Warehouse Failure',
    props<{ payload: ErrorHandler }>()
);

export const updateWarehouseSuccess = createAction('[Warehouses] Update Warehouse Success');

// -----------------------------------------------------------------------------------------------------
// [HELPER] Warehouse Confirmation Change Invoice
// -----------------------------------------------------------------------------------------------------

export const confirmationChangeInvoiceRequest = createAction(
    '[Warehouses Update] Confirmation Change Invoice Request',
    props<{ payload: PayloadWarehouseConfirmation }>()
);

export const confirmationChangeInvoiceFailure = createAction(
    '[Warehouses Update] Confirmation Change Invoice Failure',
    props<{ payload: ErrorHandler }>()
);

export const confirmationChangeInvoiceSuccess = createAction(
    '[Warehouses Update] Confirmation Change Invoice Success'
);

export const clearState = createAction('[Warehouses] Reset Core State');

export type FailureActions =
    | 'fetchWarehousesFailure'
    | 'fetchWarehouseFailure'
    | 'createWarehouseFailure'
    | 'updateWarehouseFailure'
    | 'confirmationChangeInvoiceFailure';
