import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models';

// -----------------------------------------------------------------------------------------------------
// Fetch Sales Reps
// -----------------------------------------------------------------------------------------------------

export const fetchSalesRepsRequest = createAction(
    '[Sales Reps API] Fetch Sales Reps Request',
    props<{ payload: any }>()
);

export const fetchSalesRepsFailure = createAction(
    '[Sales Reps API] Fetch Sales Reps Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchSalesRepsSuccess = createAction(
    '[Sales Reps API] Fetch Sales Reps Success',
    props<{ payload: { data: Array<any>; total: number } }>()
);

export const resetState = createAction('[Sales Rep Page] Reset Core State');
