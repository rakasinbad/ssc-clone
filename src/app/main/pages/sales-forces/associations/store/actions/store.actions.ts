import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

import { Store } from '../../models';

export type failureActionNames =
    'fetchStoresFailure';

// -----------------------------------------------------------------------------------------------------
// Fetch Stores
// -----------------------------------------------------------------------------------------------------

export const fetchStoresRequest = createAction(
    '[Associations/Stores API] Fetch Stores Request',
    props<{ payload: IQueryParams }>()
);

export const fetchStoresFailure = createAction(
    '[Associations/Stores API] Fetch Stores Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchStoresSuccess = createAction(
    '[Associations/Stores API] Fetch Stores Success',
    props<{ payload: { data: Array<Store>; total: number } }>()
);

export const clearState = createAction('[Associations Page/Store State] Reset Core State');
