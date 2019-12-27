import { createAction, props } from '@ngrx/store';
import { IErrorHandler, TSource, IQueryParams } from 'app/shared/models';
import { Store } from 'app/main/pages/attendances/models';

export type requestActionNames =
    'fetchStoresRequest'
;

export type failureActionNames =
    'fetchStoresFailure';

/** STORES */
export const fetchStoresRequest = createAction(
    '[Portfolios API] Fetch Stores Request',
    props<{ payload: IQueryParams }>()
);

export const fetchStoresFailure = createAction(
    '[Portfolios API] Fetch Stores Failure',
    props<{ payload: IErrorHandler }>()
);
    
export const fetchStoresSuccess = createAction(
    '[Portfolios API] Fetch Stores Success',
    props<{ payload: { stores?: Array<Store>; source: TSource; total?: number } }>()
);

export const addSelectedStores = createAction(
    '[Portfolios Page] Add Selected Stores',
    props<{ payload: Array<Store> }>()
);

export const removeSelectedStores = createAction(
    '[Portfolios Page] Remove Selected Stores',
    props<{ payload: Array<string> }>()
);