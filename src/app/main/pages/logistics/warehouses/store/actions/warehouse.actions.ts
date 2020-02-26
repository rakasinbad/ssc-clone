import { createAction, props } from '@ngrx/store';
import { ErrorHandler, IQueryParams } from 'app/shared/models';

import { Warehouse } from '../../models';

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

export type FailureActions = 'fetchWarehousesFailure';
