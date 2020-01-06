import { createAction, props } from '@ngrx/store';
import { ErrorHandler, IQueryParams } from 'app/shared/models';
import { Association } from '../../models';

/**
 * ASSOCIATIONS
 */

export const fetchAssociationRequest = createAction(
    '[Associations API] Fetch Association Request',
    props<{ payload: IQueryParams }>()
);

export const fetchAssociationFailure = createAction(
    '[Associations API] Fetch Association Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchAssociationSuccess = createAction(
    '[Associations API] Fetch Association Success',
    props<{ payload: { data: Array<Association>; total: number } }>()
);

export const setSearchValue = createAction(
    '[Associations PAGE] Set Search Value',
    props<{ payload: string }>()
);

export const clearState = createAction('[Association Page] Reset Core State');
