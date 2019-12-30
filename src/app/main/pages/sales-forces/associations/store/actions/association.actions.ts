import { createAction, props } from '@ngrx/store';
import { ErrorHandler, IQueryParams } from 'app/shared/models';
import { Association } from '../../models';

/**
 * ASSOCIATIONS
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

export const clearState = createAction('[Associations Page] Reset Core State');
