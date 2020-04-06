import { createAction, props } from '@ngrx/store';
import { FlexiCombo } from '../../models';
import { IQueryParams } from 'app/shared/models/query.model';
import { IErrorHandler, TNullable } from 'app/shared/models/global.model';
import { FlexiComboCreationPayload } from '../../models/flexi-combo.model';

export type requestActionNames =
    | 'fetchFlexiComboRequest'
    | 'addFlexiComboRequest'
    | 'updateFlexiComboRequest'
    | 'removeFlexiComboRequest';

export type failureActionNames =
    | 'fetchFlexiComboFailure'
    | 'addFlexiComboFailure'
    | 'updateFlexiComboFailure'
    | 'removeFlexiComboFailure';

/**
 * FETCH DATA
 */

export const fetchFlexiComboRequest = createAction(
    '[Flexi Combo API] Fetch FlexiCombo Request',
    props<{ payload: IQueryParams }>()
);

export const fetchFlexiComboFailure = createAction(
    '[Flexi Combo API] Fetch FlexiCombo Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchFlexiComboSuccess = createAction(
    '[Flexi Combo API] Fetch FlexiCombo Success',
    props<{ payload: { data: Array<FlexiCombo>; total: number } }>()
);

/**
 * CONFIRMATION
 */

export const confirmAddFlexiCombo = createAction(
    '[FlexiCombo Page] Confirm Add FlexiCombo',
    props<{ payload: FlexiCombo }>()
);

export const confirmUpdateFlexiCombo = createAction(
    '[FlexiCombo Page] Confirm Update FlexiCombo',
    props<{ payload: FlexiCombo }>()
);

export const confirmRemoveFlexiCombo = createAction(
    '[FlexiCombo Page] Confirm Remove FlexiCombo',
    props<{ payload: Array<string> }>()
);

/**
 * CREATE (ADD)
 */
export const addFlexiComboRequest = createAction(
    '[Flexi Combo API] Add FlexiCombo Request',
    props<{ payload: FlexiComboCreationPayload }>()
);

export const addFlexiComboSuccess = createAction(
    '[Flexi Combo API] Add FlexiCombo Success',
    props<{ payload: TNullable<FlexiCombo> }>()
);

export const addFlexiComboFailure = createAction(
    '[Flexi Combo API] Add FlexiCombo Failure',
    props<{ payload: IErrorHandler }>()
);

/**
 * UPDATE
 */
export const updateFlexiComboRequest = createAction(
    '[Flexi Combo API] Update FlexiCombo Request',
    props<{ payload: { id: string; data: FlexiCombo } }>()
);

export const updateFlexiComboSuccess = createAction(
    '[Flexi Combo API] Update FlexiCombo Success',
    props<{ payload: { id: string; data: FlexiCombo } }>()
);

export const updateFlexiComboFailure = createAction(
    '[Flexi Combo API] Update FlexiCombo Failure',
    props<{ payload: IErrorHandler }>()
);

/**
 * REMOVE (DELETE)
 */
export const removeFlexiComboRequest = createAction(
    '[Flexi Combo API] Remove FlexiCombo Request',
    props<{ payload: string }>()
);

export const removeFlexiComboSuccess = createAction(
    '[Flexi Combo API] Remove FlexiCombo Success',
    props<{ payload: { id: string; data: FlexiCombo } }>()
);

export const removeFlexiComboFailure = createAction(
    '[Flexi Combo API] Remove FlexiCombo Failure',
    props<{ payload: IErrorHandler }>()
);

/**
 * RESET
 */
export const resetFlexiCombo = createAction('[FlexiCombo Page] Reset FlexiCombo State');
