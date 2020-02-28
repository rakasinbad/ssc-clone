import { createAction, props } from '@ngrx/store';
import { IQueryParams, ErrorHandler } from 'app/shared/models';

export type failureActionNames =
    'fetchWarehouseCoveragesFailure' |
    'createWarehouseCoverageFailure'
;

export const fetchWarehouseCoveragesRequest = createAction(
    '[Warehouse Coverages] Fetch Warehouse Coverages Request',
    props<{ payload: IQueryParams }>()
);

export const fetchWarehouseCoveragesFailure = createAction(
    '[Warehouse Coverages] Fetch Warehouse Coverages Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchWarehouseCoveragesSuccess = createAction(
    '[Warehouse Coverages] Fetch Warehouse Coverages Success',
    props<{ payload: { data: any; total: number } }>()
);

export const createWarehouseCoverageRequest = createAction(
    '[Warehouse Coverages] Create Warehouse Coverage Request',
    props<{ payload: { warehouseId: number; urbanId: Array<number>; } }>()
);

export const createWarehouseCoverageFailure = createAction(
    '[Warehouse Coverages] Create Warehouse Coverage Failure',
    props<{ payload: ErrorHandler }>()
);

export const createWarehouseCoverageSuccess = createAction(
    '[Warehouse Coverages] Create Warehouse Coverage Success',
    props<{ payload: { message: string } }>()
);
