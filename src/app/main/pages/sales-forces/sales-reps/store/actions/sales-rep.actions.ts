import { Update } from '@ngrx/entity';
import { createAction, props } from '@ngrx/store';
import { ErrorHandler, EStatus } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

import {
    SalesRep,
    SalesRepBatchActions,
    SalesRepForm,
    SalesRepFormPasswordPut,
    SalesRepFormPatch
} from '../../models';

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
// [CRUD - CHANGE STATUS] Sales Rep
// -----------------------------------------------------------------------------------------------------

export const confirmChangeStatusSalesRep = createAction(
    '[Sales Reps Page] Confirm Change Status Sales Rep',
    props<{ payload: SalesRep }>()
);

export const changeStatusSalesRepRequest = createAction(
    '[Sales Reps API] Change Status Sales Rep Request',
    props<{ payload: { body: EStatus; id: string } }>()
);

export const changeStatusSalesRepFailure = createAction(
    '[Sales Reps API] Change Status Sales Rep Failure',
    props<{ payload: ErrorHandler }>()
);

export const changeStatusSalesRepSuccess = createAction(
    '[Sales Reps API] Change Status Sales Rep Success',
    props<{ payload: Update<SalesRep> }>()
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

// -----------------------------------------------------------------------------------------------------
// [CRUD - BATCH SET ACTIVE] Sales Reps
// -----------------------------------------------------------------------------------------------------

export const batchSetActiveSalesRepsRequest = createAction(
    '[Sales Reps API] Batch Set Active Sales Rep Request',
    props<{ payload: { ids: Array<string>; status: SalesRepBatchActions.ACTIVE } }>()
);

export const batchSetActiveSalesRepsFailure = createAction(
    '[Sales Reps API] Batch Set Active Sales Rep Failure',
    props<{ payload: ErrorHandler }>()
);

export const batchSetActiveSalesRepsSuccess = createAction(
    '[Sales Reps API] Batch Set Active Sales Rep Success',
    props<{ payload: Array<Update<SalesRep>> }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - BATCH SET INACTIVE] Sales Reps
// -----------------------------------------------------------------------------------------------------

export const batchSetInactiveSalesRepsRequest = createAction(
    '[Sales Reps API] Batch Set Inactive Sales Rep Request',
    props<{ payload: { ids: Array<string>; status: SalesRepBatchActions.INACTIVE } }>()
);

export const batchSetInactiveSalesRepsFailure = createAction(
    '[Sales Reps API] Batch Set Inactive Sales Rep Failure',
    props<{ payload: ErrorHandler }>()
);

export const batchSetInactiveSalesRepsSuccess = createAction(
    '[Sales Reps API] Batch Set Inactive Sales Rep Success',
    props<{ payload: Array<Update<SalesRep>> }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - BATCH DELETE] Sales Reps
// -----------------------------------------------------------------------------------------------------

export const batchDeleteSalesRepsRequest = createAction(
    '[Sales Reps API] Batch Delete Sales Rep Request',
    props<{ payload: { ids: Array<string>; status: SalesRepBatchActions.DELETE } }>()
);

export const batchDeleteSalesRepsFailure = createAction(
    '[Sales Reps API] Batch Delete Sales Rep Failure',
    props<{ payload: ErrorHandler }>()
);

export const batchDeleteSalesRepsSuccess = createAction(
    '[Sales Reps API] Batch Delete Sales Rep Success',
    props<{ payload: Array<string> }>()
);

export const clearState = createAction('[Sales Rep Page] Reset Core State');
