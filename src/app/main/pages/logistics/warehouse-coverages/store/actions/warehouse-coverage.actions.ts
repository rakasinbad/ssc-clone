import { createAction, props } from '@ngrx/store';
import { IQueryParams } from 'app/shared/models/query.model';
import { ErrorHandler } from 'app/shared/models/global.model';
import { WarehouseCoverage } from '../../models/warehouse-coverage.model';
import { NotCoveredWarehouse } from '../../models/not-covered-warehouse.model';

export type failureActionNames =
    'fetchWarehouseCoveragesFailure' |
    'createWarehouseCoverageFailure'
;

export const fetchWarehouseCoveragesRequest = createAction(
    '[Warehouse/Warehouse Coverages] Fetch Warehouse Coverages Request',
    props<{ payload: IQueryParams }>()
);

export const fetchWarehouseCoveragesFailure = createAction(
    '[Warehouse/Warehouse Coverages] Fetch Warehouse Coverages Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchWarehouseCoveragesSuccess = createAction(
    '[Warehouse/Warehouse Coverages] Fetch Warehouse Coverages Success',
    props<{ payload: { data: Array<WarehouseCoverage> | Array<NotCoveredWarehouse>; total: number } }>()
);

export const createWarehouseCoverageRequest = createAction(
    '[Warehouse/Warehouse Coverages] Create Warehouse Coverage Request',
    props<{ payload: { warehouseId: number; urbanId: Array<number>; } }>()
);

export const createWarehouseCoverageFailure = createAction(
    '[Warehouse/Warehouse Coverages] Create Warehouse Coverage Failure',
    props<{ payload: ErrorHandler }>()
);

export const createWarehouseCoverageSuccess = createAction(
    '[Warehouse/Warehouse Coverages] Create Warehouse Coverage Success',
    props<{ payload: { message: string } }>()
);

export const selectWarehouse = createAction(
    '[Warehouse/Warehouse Coverages] Select Warehouse',
    props<{ payload: string }>()
);

export const deselectWarehouse = createAction('[Warehouse/Warehouse Coverages] Deselect Warehouse');

export const truncateWarehouseCoverages = createAction('[Warehouse/Warehouse Coverages] Truncate Warehouse Coverages');
