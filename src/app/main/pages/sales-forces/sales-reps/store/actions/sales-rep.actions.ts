import { createAction, props } from '@ngrx/store';
import { ErrorHandler, IQueryParams } from 'app/shared/models';

import { SalesRep, SalesRepForm } from '../../models';

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

// -----------------------------------------------------------------------------------------------------
// [CRUD - ADD] Sales Reps
// -----------------------------------------------------------------------------------------------------

export const createSalesRepRequest = createAction(
    '[Sales Reps API] Create Sales Rep Request',
    props<{ payload: Required<SalesRepForm> }>()
);

export const createSalesRepFailure = createAction(
    '[Sales Reps API] Create Sales Rep Failure',
    props<{ payload: ErrorHandler }>()
);

export const createSalesRepSuccess = createAction(
    '[Sales Reps API] Create Sales Rep Success',
    props<{ payload: SalesRep }>()
);

export const resetState = createAction('[Sales Rep Page] Reset Core State');
