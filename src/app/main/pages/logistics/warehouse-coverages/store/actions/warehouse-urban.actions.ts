import { createAction, props } from '@ngrx/store';
import { IQueryParams } from 'app/shared/models/query.model';
import { ErrorHandler } from 'app/shared/models/global.model';
import { WarehouseCoverage } from '../../models/warehouse-coverage.model';

export type failureActionNames =
    'fetchWarehouseUrbansFailure' |
    'createWarehouseUrbanFailure'
;

export const fetchWarehouseUrbansRequest = createAction(
    '[Warehouse/Warehouse Coverage/Warehouse Urban] Fetch Warehouse Urbans Request',
    props<{ payload: IQueryParams }>()
);

export const fetchWarehouseUrbansFailure = createAction(
    '[Warehouse/Warehouse Coverage/Warehouse Urban] Fetch Warehouse Urbans Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchWarehouseUrbansSuccess = createAction(
    '[Warehouse/Warehouse Coverage/Warehouse Urban] Fetch Warehouse Urbans Success',
    props<{ payload: { data: Array<WarehouseCoverage>; total: number } }>()
);

export const truncateWarehouseUrbans = createAction('[Warehouse/Warehouse Coverage/Warehouse Urban] Truncate Warehouse Urbans');
