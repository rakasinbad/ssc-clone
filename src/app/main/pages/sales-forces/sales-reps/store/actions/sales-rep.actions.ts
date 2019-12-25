import { createAction, props } from '@ngrx/store';
import { ErrorHandler, IQueryParams } from 'app/shared/models';

import { SalesRep } from '../../models';

// -----------------------------------------------------------------------------------------------------
// Fetch Sales Reps
// -----------------------------------------------------------------------------------------------------

export const fetchSalesRepsRequest = createAction(
    '[Sales Reps API] Fetch Sales Reps Request',
    props<{ payload: IQueryParams }>()
);

export const fetchSalesRepsFailure = createAction(
    '[Sales Reps API] Fetch Sales Reps Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchSalesRepsSuccess = createAction(
    '[Sales Reps API] Fetch Sales Reps Success',
    props<{ payload: { data: Array<SalesRep>; total: number } }>()
);

export const resetState = createAction('[Sales Rep Page] Reset Core State');
