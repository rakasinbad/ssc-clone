import { createAction, props } from '@ngrx/store';
import { IQueryParams, ErrorHandler } from 'app/shared/models';

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
    props<{ payload: { data: any; total: number } }>()
);
