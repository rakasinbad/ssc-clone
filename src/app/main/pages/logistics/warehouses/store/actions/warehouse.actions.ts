import { createAction, props } from '@ngrx/store';
import { ErrorHandler, IQueryParams } from 'app/shared/models';

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

export const clearState = createAction('[Warehouses] Reset Core State');

export type FailureActions =
    | 'fetchWarehousesFailure'
    | 'fetchWarehouseFailure'
    | 'createWarehouseFailure';
