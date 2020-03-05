import { createAction, props } from '@ngrx/store';
import { Store as Merchant } from 'app/main/pages/accounts/merchants/models';
import { IErrorHandler, TSource } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

/**
 * STORE
 */

export const fetchStoreRequest = createAction(
    '[Attendances API] Fetch Store Request',
    props<{ payload: string }>()
);

export const fetchStoreFailure = createAction(
    '[Attendances API] Fetch Store Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchStoreSuccess = createAction(
    '[Attendances API] Fetch Store Success',
    props<{ payload: { merchant?: Merchant; source: TSource } }>()
);

export const setSelectedStore = createAction(
    '[Attendances Page] Set Selected Store',
    props<{ payload: Merchant }>()
);

export const resetSelectedStore = createAction('[Attendances Page] Reset Selected Store');

/**
 * STORES
 */

export const fetchStoresRequest = createAction(
    '[Attendances API] Fetch Stores Request',
    props<{ payload: IQueryParams }>()
);

export const fetchStoresFailure = createAction(
    '[Attendances API] Fetch Stores Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchStoresSuccess = createAction(
    '[Attendances API] Fetch Stores Success',
    props<{ payload: { merchants?: Array<Merchant>; total: number; source: TSource } }>()
);
