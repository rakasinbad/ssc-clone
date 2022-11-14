import { createAction, props } from '@ngrx/store';
import { ErrorHandler, EStatus } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { Update } from '@ngrx/entity';
import { ProductList } from '../../models';

// -----------------------------------------------------------------------------------------------------
// Fetch Product List
// -----------------------------------------------------------------------------------------------------

export const fetchProductListRequest = createAction(
    '[Add Product API] Fetch Product List Request',
    props<{ payload: IQueryParams }>()
);

export const fetchProductListFailure = createAction(
    '[Add Product API] Fetch Product List Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchProductListSuccess = createAction(
    '[Add Product API] Fetch Product List Success',
    props<{ payload: { data: ProductList[]; total: number } }>()
);

export const setRefreshStatus = createAction(
    '[Add Product Page] Set Refresh Statuse',
    props<{ payload: boolean }>()
);

export const clearState = createAction('[Product List Page] Reset Product List Core State');

export type FailureActions = 'fetchProductListFailure';
