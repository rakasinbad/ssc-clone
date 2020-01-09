import { createAction, props } from '@ngrx/store';
import { ErrorHandler, IQueryParams } from 'app/shared/models';
import { Association, IAssociationForm } from '../../models';

export type failureActionNames =
    'createAssociationFailure' |
    'fetchAssociationFailure'
;

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

export const createAssociationRequest = createAction(
    '[Associations API] Create Association Request',
    props<{ payload: IAssociationForm }>()
);

export const createAssociationFailure = createAction(
    '[Associations API] Create Association Failure',
    props<{ payload: ErrorHandler }>()
);

export const createAssociationSuccess = createAction(
    '[Associations API] Create Association Success',
    props<{ payload: { message: string } }>()
);

export const clearState = createAction('[Association Page] Reset Core State');
