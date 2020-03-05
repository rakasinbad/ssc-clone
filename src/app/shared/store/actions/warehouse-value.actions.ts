import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { WarehouseValue } from 'app/shared/models/warehouse-value.model';

// -----------------------------------------------------------------------------------------------------
// Fetch [Warehouse Value]
// -----------------------------------------------------------------------------------------------------

export const fetchWarehouseValueRequest = createAction(
    '[Helper Sources - Warehouse Value API] Fetch Warehouse Value Request',
    props<{ payload: IQueryParams }>()
);

export const fetchWarehouseValueFailure = createAction(
    '[Helper Sources - Warehouse Value API] Fetch Warehouse Value Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchWarehouseValueSuccess = createAction(
    '[Helper Sources - Warehouse Value API] Fetch Warehouse Value Success',
    props<{ payload: Array<WarehouseValue> }>()
);

// -----------------------------------------------------------------------------------------------------
// Helper Actions
// -----------------------------------------------------------------------------------------------------

export const clearWarehouseValueState = createAction(
    '[Helper Sources - Warehouse Value] Clear Warehouse Value State'
);

export type FailureActions = 'fetchWarehouseValueFailure';
