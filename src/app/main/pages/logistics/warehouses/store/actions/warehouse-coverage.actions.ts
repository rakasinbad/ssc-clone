import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { WarehouseCoverage } from 'app/shared/models/warehouse-coverage.model';

// -----------------------------------------------------------------------------------------------------
// Fetch Warehouse Coverages
// -----------------------------------------------------------------------------------------------------

export const fetchWarehouseCoveragesRequest = createAction(
    '[Warehouse Coverages] Fetch Warehouse Coverages Request',
    props<{ payload: { params: IQueryParams; warehouseId: string } }>()
);

export const fetchWarehouseCoveragesFailure = createAction(
    '[Warehouse Coverages] Fetch Warehouse Coverages Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchWarehouseCoveragesSuccess = createAction(
    '[Warehouse Coverages] Fetch Warehouse Coverages Success',
    props<{ payload: { data: Array<WarehouseCoverage>; total: number } }>()
);

export const clearState = createAction('[Warehouse Coverages] Reset Core State');

export type FailureActions = 'fetchWarehouseCoveragesFailure';
