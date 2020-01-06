import { createAction, props } from '@ngrx/store';
import { ErrorHandler, IQueryParams } from 'app/shared/models';
import { AssociationStore } from '../../models';

/**
 * ASSOCIATIONS
 */

export const fetchAssociationStoresRequest = createAction(
    '[Associations Stores API] Fetch Association Stores Request',
    props<{ payload: IQueryParams }>()
);

export const fetchAssociationStoresFailure = createAction(
    '[Associations Stores API] Fetch Association Stores Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchAssociationStoresSuccess = createAction(
    '[Associations Stores API] Fetch Association Stores Success',
    props<{ payload: { data: Array<AssociationStore>; total: number } }>()
);

export const clearStoreState = createAction('[Association Page] Reset Core State');
