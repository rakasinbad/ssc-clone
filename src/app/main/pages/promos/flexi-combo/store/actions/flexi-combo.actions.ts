import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

import { CreateFlexiComboDto, FlexiCombo, PatchFlexiComboDto } from '../../models';

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
    props<{ payload: string }>()
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

export const clearState = createAction('[Flexi Combo] Reset Flexi Combo Core State');

export type FailureActions =
    | 'fetchFlexiCombosFailure'
    | 'fetchFlexiComboFailure'
    | 'createFlexiComboFailure'
    | 'updateFlexiComboFailure';
