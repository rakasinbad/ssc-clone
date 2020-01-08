import { createAction, props } from '@ngrx/store';
import { IErrorHandler, TSource, IQueryParams } from 'app/shared/models';
import { Store } from 'app/main/pages/attendances/models';
import { Filter } from '../../models';

export type requestActionNames =
    'fetchStoresRequest'
;

export type failureActionNames =
    'fetchStoresFailure' |
    'checkStoreAtInvoiceGroupFailure';

/** REQUESTS */
export const applyStoreFilter = createAction(
    '[Stores] Apply Stores Filter',
    props<{ payload: Array<Filter> }>()
);

export const removeStoreFilter = createAction(
    '[Stores] Remove Store Filter',
    props<{ payload: string }>()
);

export const removeAllStoreFilters = createAction('[Stores] Remove All Store Filters');

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

export const checkStoreAtInvoiceGroupRequest = createAction(
    '[Store Portfolio Lists API] Check Store is at Invoice Group Request',
    props<{ payload: { storeId: string; invoiceGroupId: string } }>()
);

export const checkStoreAtInvoiceGroupFailure = createAction(
    '[Store Portfolio Lists API] Check Store is at Invoice Group Failure',
    props<{ payload: IQueryParams }>()
);

export const checkStoreAtInvoiceGroupSuccess = createAction(
    '[Store Portfolio Lists API] Check Store is at Invoice Group Success',
    props<{ payload: { message: string; portfolioId?: string; storeId?: string; name?: string; code?: string } }>()
);

export const setStoreEntityType = createAction(
    '[Portfolios Page] Set Store Entity Type',
    props<{ payload: string }>()
);

export const addSelectedStores = createAction(
    '[Portfolios Page] Add Selected Stores',
    props<{ payload: Array<Store> }>()
);

export const removeSelectedStores = createAction(
    '[Portfolios Page] Remove Selected Stores',
    props<{ payload: Array<string> }>()
);
