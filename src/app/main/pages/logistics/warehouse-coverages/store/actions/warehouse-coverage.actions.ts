import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

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
