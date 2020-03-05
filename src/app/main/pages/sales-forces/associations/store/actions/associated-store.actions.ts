import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { Store } from 'app/shared/models/store.model';

export type failureActionNames = 'fetchAssociatedStoresFailure';

/**
 * ASSOCIATIONS
 */

export const fetchAssociatedStoresRequest = createAction(
    '[Associations API] Fetch Associated Stores Request',
    props<{ payload: IQueryParams }>()
);

export const fetchAssociatedStoresFailure = createAction(
    '[Associations API] Fetch Associated Stores Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchAssociatedStoresSuccess = createAction(
    '[Associations API] Fetch Associated Stores Success',
    props<{ payload: { data: Array<Store>; total: number } }>()
);

export const addSelectedStores = createAction(
    '[Associations] Add Selected Stores',
    props<{ payload: Array<Store> }>()
);

export const removeSelectedStores = createAction(
    '[Associations] Remove Selected Stores',
    props<{ payload: Array<string> }>()
);

export const markStoreAsRemoved = createAction(
    '[Associations Page] Mark Store as Removed',
    props<{ payload: Array<string> }>()
);

export const abortStoreAsRemoved = createAction(
    '[Associations Page] Abort to Mark Store as Removed',
    props<{ payload: Array<string> }>()
);

export const markInitialized = createAction('[Associations] Mark as Initialized');

export const abortInitialized = createAction('[Associations] Abort as Initialized');

export const confirmToClearAssociatedStores = createAction(
    '[Associations Page] Confirm to Clear Associated Stores'
);

export const clearAssociatedStores = createAction('[Associations Page] Clear Associated Stores');
