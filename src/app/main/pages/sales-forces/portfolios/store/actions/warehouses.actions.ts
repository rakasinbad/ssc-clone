import { Update } from '@ngrx/entity';
import { createAction, props } from '@ngrx/store';
import { Store } from 'app/main/pages/accounts/merchants/models';
import { IErrorHandler, TSource } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { Warehouse } from '../../models';

export type requestActionNames = 'fetchWarehouseListRequest';

export type failureActionNames = 'fetchWarehouseListFailure';

/** WAREHOUSE */
export const fetchWarehouseRequest = createAction(
    '[Warehouses API] Fetch Warehouse Request',
    props<{ payload: string }>()
);

export const fetchWarehouseFailure = createAction(
    '[Warehouses API] Fetch Warehouse Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchWarehouseSuccess = createAction(
    '[Warehouses API] Fetch Warehouse Success',
    props<{ payload: { warehouses: Array<Warehouse>; source: TSource } }>()
);

// export const truncateWarehouses = 