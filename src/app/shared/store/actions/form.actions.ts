import { createAction, props } from '@ngrx/store';

export const clickSaveButton = createAction('[Helper Form] Click Save Button');
export const enableSaveButton = createAction('[Helper Form] Enable Save Button');
export const disableSaveButton = createAction('[Helper Form] Disable Save Button');
export const resetClickSaveButton = createAction('[Helper Form] Reset Click Save Button');

export const clickResetButton = createAction('[Helper Form] Click Reset Button');
export const resetClickResetButton = createAction('[Helper Form] Reset Click Reset Button');

export const clickCancelButton = createAction('[Helper Form] Click Cancel Button');
export const resetClickCancelButton = createAction('[Helper Form] Reset Click Cancel Button');

export const setCancelButtonAction = createAction(
    '[Helper Form] Set Cancel Button Action',
    props<{ payload: string }>()
);
export const resetCancelButtonAction = createAction('[Helper Form] Reset Cancel Button Action');

export const setFormStatusInvalid = createAction('[Helper Form] Form Status Invalid');
export const setFormStatusValid = createAction('[Helper Form] Form Status Valid');
export const resetFormStatus = createAction('[Helper Form] Reset Form Status');
