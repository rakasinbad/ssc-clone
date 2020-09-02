import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

import { SalesRep } from '../..//models';

export type failureActionNames =
    'fetchSalesRepsFailure';

// -----------------------------------------------------------------------------------------------------
// Fetch Sales Reps
// -----------------------------------------------------------------------------------------------------

export const fetchSalesRepsRequest = createAction(
    '[Associations/Sales Reps API] Fetch Sales Reps Request',
    props<{ payload: IQueryParams }>()
);

export const fetchSalesRepsFailure = createAction(
    '[Associations/Sales Reps API] Fetch Sales Reps Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchSalesRepsSuccess = createAction(
    '[Associations/Sales Reps API] Fetch Sales Reps Success',
    props<{ payload: { data: Array<SalesRep>; total: number } }>()
);

export const clearState = createAction('[Associations Page/Sales Rep State] Reset Core State');
