import { createAction, props } from '@ngrx/store';
import { ErrorHandler, IQueryParams } from 'app/shared/models';

import { SalesRep, SalesRepForm, SalesRepFormPatch, SalesRepFormPasswordPut } from '../../models';

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
// Fetch Sales Rep
// -----------------------------------------------------------------------------------------------------

export const fetchSalesRepRequest = createAction(
    '[Sales Rep API] Fetch Sales Rep Request',
    props<{ payload: string }>()
);

export const fetchSalesRepFailure = createAction(
    '[Sales Rep API] Fetch Sales Rep Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchSalesRepSuccess = createAction(
    '[Sales Rep API] Fetch Sales Rep Success',
    props<{ payload: SalesRep }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - CREATE] Sales Rep
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

// -----------------------------------------------------------------------------------------------------
// [CRUD - UPDATE] Sales Rep
// -----------------------------------------------------------------------------------------------------

export const updateSalesRepRequest = createAction(
    '[Sales Reps API] Update Sales Rep Request',
    props<{ payload: { body: SalesRepFormPatch; id: string } }>()
);

export const updateSalesRepFailure = createAction(
    '[Sales Reps API] Update Sales Rep Failure',
    props<{ payload: ErrorHandler }>()
);

export const updateSalesRepSuccess = createAction(
    '[Sales Reps API] Update Sales Rep Success',
    props<{ payload: SalesRep }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - CHANGE PASSWORD] Sales Rep
// -----------------------------------------------------------------------------------------------------

export const changePasswordSalesRepRequest = createAction(
    '[Sales Reps API] Change Password Sales Rep Request',
    props<{ payload: { body: SalesRepFormPasswordPut; id: string } }>()
);

export const changePasswordSalesRepFailure = createAction(
    '[Sales Reps API] Change Password Sales Rep Failure',
    props<{ payload: ErrorHandler }>()
);

export const changePasswordSalesRepSuccess = createAction(
    '[Sales Reps API] Change Password Rep Success',
    props<{ payload: SalesRep }>()
);

export const clearState = createAction('[Sales Rep Page] Reset Core State');
