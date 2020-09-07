import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

import { AssociationForm, Association } from '../../models';

export type failureActionNames =
    'createAssociationFailure'
    | 'fetchAssociationsFailure';

/**
 * ASSOCIATIONS - FETCH
 */

export const fetchAssociationsRequest = createAction(
    '[Associations API] Fetch Associations Request',
    props<{ payload: IQueryParams }>()
);

export const fetchAssociationsFailure = createAction(
    '[Associations API] Fetch Associations Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchAssociationsSuccess = createAction(
    '[Associations API] Fetch Associations Success',
    props<{ payload: { data: Array<Association>; total: number } }>()
);

/**
 * ASSOCIATIONS - CREATE
 */

export const createAssociationRequest = createAction(
    '[Associations API] Create Association Request',
    props<{ payload: AssociationForm }>()
);

export const createAssociationFailure = createAction(
    '[Associations API] Create Association Failure',
    props<{ payload: ErrorHandler }>()
);

export const createAssociationSuccess = createAction(
    '[Associations API] Create Association Success',
    props<{ payload: { message: string } }>()
);

// ----------------------------

export const clearState = createAction('[Association Page] Reset Core State');
