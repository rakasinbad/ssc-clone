import { createAction, props } from '@ngrx/store';
import { ErrorHandler, EStatus } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

import { CreateFlexiComboDto, FlexiCombo, PatchFlexiComboDto } from '../../models';
import { Update } from '@ngrx/entity';

// -----------------------------------------------------------------------------------------------------
// Fetch Flexi Combos
// -----------------------------------------------------------------------------------------------------

export const fetchFlexiCombosRequest = createAction(
    '[Flexi Combo] Fetch Flexi Combos Request',
    props<{ payload: IQueryParams }>()
);

export const fetchFlexiCombosFailure = createAction(
    '[Flexi Combo] Fetch Flexi Combos Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchFlexiCombosSuccess = createAction(
    '[Flexi Combo] Fetch Flexi Combos Success',
    props<{ payload: { data: FlexiCombo[]; total: number } }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Flexi Combo
// -----------------------------------------------------------------------------------------------------

export const fetchFlexiComboRequest = createAction(
    '[Flexi Combo] Fetch Flexi Combo Request',
    props<{ payload: { id: string, parameter?: IQueryParams } }>()
);

export const fetchFlexiComboFailure = createAction(
    '[Flexi Combo] Fetch Flexi Combo Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchFlexiComboSuccess = createAction(
    '[Flexi Combo] Fetch Flexi Combo Success',
    props<{ payload: FlexiCombo }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - CREATE] Flexi Combo
// -----------------------------------------------------------------------------------------------------

export const createFlexiComboRequest = createAction(
    '[Flexi Combo] Create Flexi Combo Request',
    props<{ payload: CreateFlexiComboDto }>()
);

export const createFlexiComboFailure = createAction(
    '[Flexi Combo] Create Flexi Combo Failure',
    props<{ payload: ErrorHandler }>()
);

export const createFlexiComboSuccess = createAction('[Flexi Combo] Create Flexi Combo Success');

// -----------------------------------------------------------------------------------------------------
// [CRUD - UPDATE] Flexi Combo
// -----------------------------------------------------------------------------------------------------

export const updateFlexiComboRequest = createAction(
    '[Flexi Combo] Update Flexi Combo Request',
    props<{ payload: { body: PatchFlexiComboDto; id: string } }>()
);

export const updateFlexiComboFailure = createAction(
    '[Flexi Combo] Update Flexi Combo Failure',
    props<{ payload: ErrorHandler }>()
);

export const updateFlexiComboSuccess = createAction('[Flexi Combo] Update Flexi Combo Success');

// -----------------------------------------------------------------------------------------------------
// [CRUD - DELETE] Flexi Combo
// -----------------------------------------------------------------------------------------------------

export const confirmDeleteFlexiCombo = createAction(
    '[Flexi Combo] Confirm Delete Flexi Combo',
    props<{ payload: FlexiCombo }>()
);

export const deleteFlexiComboRequest = createAction(
    '[Flexi Combo] Delete Flexi Combo Request',
    props<{ payload: string }>()
);

export const deleteFlexiComboFailure = createAction(
    '[Flexi Combo] Delete Flexi Combo Failure',
    props<{ payload: ErrorHandler }>()
);

export const deleteFlexiComboSuccess = createAction(
    '[Flexi Combo] Delete Flexi Combo Success',
    props<{ payload: string }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - CHANGE STATUS] Flexi Combo
// -----------------------------------------------------------------------------------------------------

export const confirmChangeStatus = createAction(
    '[Flexi Combo] Confirm Change Status',
    props<{ payload: FlexiCombo }>()
);

export const changeStatusRequest = createAction(
    '[Flexi Combo] Change Status Request',
    props<{ payload: { body: EStatus; id: string } }>()
);

export const changeStatusFailure = createAction(
    '[Flexi Combo] Change Status Failure',
    props<{ payload: ErrorHandler }>()
);

export const changeStatusSuccess = createAction(
    '[Flexi Combo] Change Status Success',
    props<{ payload: Update<FlexiCombo> }>()
);

export const clearState = createAction('[Flexi Combo] Reset Flexi Combo Core State');

export type FailureActions =
    | 'fetchFlexiCombosFailure'
    | 'fetchFlexiComboFailure'
    | 'createFlexiComboFailure'
    | 'updateFlexiComboFailure'
    | 'deleteFlexiComboFailure'
    | 'changeStatusFailure';
