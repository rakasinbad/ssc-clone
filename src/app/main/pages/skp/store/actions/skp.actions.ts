import { createAction, props } from '@ngrx/store';
import { ErrorHandler, EStatus } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

import { SkpModel, CreateSkpDto, UpdateSkpDto, SkpDetail } from '../../models';
import { Update } from '@ngrx/entity';

// -----------------------------------------------------------------------------------------------------
// Fetch SKP List
// -----------------------------------------------------------------------------------------------------

export const fetchSkpListRequest = createAction(
    '[SKP] Fetch SKP List Request',
    props<{ payload: IQueryParams }>()
);

export const fetchSkpListFailure = createAction(
    '[SKP] Fetch SKP List Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchSkpListSuccess = createAction(
    '[SKP] Fetch SKP List Success',
    props<{ payload: { data: SkpModel[]; total: number } }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch SKP Detail
// -----------------------------------------------------------------------------------------------------

export const fetchSkpRequest = createAction(
    '[SKP] Fetch SKP Request',
    props<{ payload: { id: string, parameter?: IQueryParams } }>()
);

export const fetchSkpFailure = createAction(
    '[SKP] Fetch SKP Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchSkpSuccess = createAction(
    '[SKP] Fetch SKP Success',
    props<{ payload: SkpModel }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - CREATE] SKP
// -----------------------------------------------------------------------------------------------------

export const createSkpRequest = createAction(
    '[SKP] Create SKP Request',
    props<{ payload: CreateSkpDto }>()
);

export const createSkpFailure = createAction(
    '[SKP] Create SKP Failure',
    props<{ payload: ErrorHandler }>()
);

export const createSkpSuccess = createAction('[SKP] Create Skp Success');

// -----------------------------------------------------------------------------------------------------
// [CRUD - UPDATE] SKP
// -----------------------------------------------------------------------------------------------------

export const updateSkpRequest = createAction(
    '[SKP] Update SKP Request',
    props<{ payload: { body: UpdateSkpDto; id: string } }>()
);

export const updateSkpFailure = createAction(
    '[SKP] Update SKP Failure',
    props<{ payload: ErrorHandler }>()
);

export const updateSkpSuccess = createAction('[SKP] Update SKP Success');

// -----------------------------------------------------------------------------------------------------
// [CRUD - DELETE] SKP
// -----------------------------------------------------------------------------------------------------

export const confirmDeleteSkp = createAction(
    '[SKP] Confirm Delete SKP',
    props<{ payload: SkpModel }>()
);

export const deleteSkpRequest = createAction(
    '[SKP] Delete SKP Request',
    props<{ payload: string }>()
);

export const deleteSkpFailure = createAction(
    '[SKP] Delete SKP Failure',
    props<{ payload: ErrorHandler }>()
);

export const deleteSkpSuccess = createAction(
    '[SKP] Delete SKP Success',
    props<{ payload: string }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - CHANGE STATUS] SKP
// -----------------------------------------------------------------------------------------------------

export const confirmChangeStatus = createAction(
    '[SKP] Confirm Change Status',
    props<{ payload: SkpModel }>()
);

export const changeStatusRequest = createAction(
    '[SKP] Change Status Request',
    props<{ payload: { body: EStatus; id: string } }>()
);

export const changeStatusFailure = createAction(
    '[SKP] Change Status Failure',
    props<{ payload: ErrorHandler }>()
);

export const changeStatusSuccess = createAction(
    '[SKP] Change Status Success',
    props<{ payload: Update<SkpModel> }>()
);

export const clearState = createAction('[SKP] Reset SKP Core State');

export type FailureActions =
    | 'fetchSkpListFailure'
    | 'fetchSkpFailure'
    | 'createSkpFailure'
    | 'updateSkpFailure'
    | 'deleteSkpFailure'
    | 'changeStatusFailure';
