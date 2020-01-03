import { createAction, props } from '@ngrx/store';
import { ErrorHandler, IQueryParams } from 'app/shared/models';
import { Association } from '../../models';

/**
 * ASSOCIATIONS
 */

export const fetchAssociationRequest = createAction(
    '[Associations Portfolios API] Fetch Association Request',
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

export const clearState = createAction('[Association Page] Reset Core State');