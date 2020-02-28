import { createAction, props } from '@ngrx/store';
import { ErrorHandler, IQueryParams } from 'app/shared/models';
import { Warehouse } from 'app/main/pages/logistics/warehouses/models/warehouse.model';

// -----------------------------------------------------------------------------------------------------
// Fetch [Warehouses]
// -----------------------------------------------------------------------------------------------------

export const fetchWarehousesRequest = createAction(
    '[Helper Sources - Warehouses API] Fetch Warehouses Request',
    props<{ payload: IQueryParams }>()
);

export const fetchWarehousesFailure = createAction(
    '[Helper Sources - Warehouses API] Fetch Warehouses Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchWarehousesSuccess = createAction(
    '[Helper Sources - Warehouses API] Fetch Warehouses Success',
    props<{ payload: { data: Array<Warehouse>; total: number } }>()
);

// -----------------------------------------------------------------------------------------------------
// Helper Actions
// -----------------------------------------------------------------------------------------------------

export const clearWarehousesState = createAction(
    '[Helper Sources - Warehouses] Clear Warehouses State'
);
