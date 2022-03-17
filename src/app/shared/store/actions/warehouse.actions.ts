import { createAction, props } from '@ngrx/store';
// import { Warehouse } from 'app/main/pages/logistics/warehouses/models';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

// -----------------------------------------------------------------------------------------------------
// Fetch [Warehouse]
// -----------------------------------------------------------------------------------------------------

export const fetchWarehouseRequest = createAction(
    '[Helper Sources - Warehouse API] Fetch Warehouse Request',
    props<{ payload: IQueryParams }>()
);

export const fetchWarehouseFailure = createAction(
    '[Helper Sources - Warehouse API] Fetch Warehouse Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchWarehouseSuccess = createAction(
    '[Helper Sources - Warehouse API] Fetch Warehouse Success',
    props<{ payload: any }>()
);

// -----------------------------------------------------------------------------------------------------
// Helper Actions
// -----------------------------------------------------------------------------------------------------

export const clearWarehouseState = createAction(
    '[Helper Sources - Warehouse] Clear Warehouse State'
);

export type FailureActions = 'fetchWarehouseFailure';
