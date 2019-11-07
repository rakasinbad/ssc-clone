import { Action, createReducer, on } from '@ngrx/store';

import { FormActions } from '../actions';

export const FEATURE_KEY = 'forms';

export interface State {
    isShowSaveButton: boolean;
    isClickResetButton: boolean;
    isClickSaveButton: boolean;
    cancelButtonAction: string;
    status: string;
}

const initialState: State = {
    isShowSaveButton: false,
    isClickResetButton: false,
    isClickSaveButton: false,
    cancelButtonAction: 'RESET',
    status: 'INVALID'
};

const formReducer = createReducer(
    initialState,
    on(FormActions.clickSaveButton, state => ({
        ...state,
        isClickSaveButton: true
    })),
    on(FormActions.enableSaveButton, state => ({
        ...state,
        isShowSaveButton: true
    })),
    on(FormActions.disableSaveButton, state => ({
        ...state,
        isShowSaveButton: false
    })),
    on(FormActions.setFormStatusInvalid, state => ({
        ...state,
        status: 'INVALID'
    })),
    on(FormActions.setFormStatusValid, state => ({
        ...state,
        status: 'VALID'
    })),
    on(FormActions.resetFormStatus, state => ({
        ...state,
        status: initialState.status
    })),
    on(FormActions.clickResetButton, state => ({
        ...state,
        isClickResetButton: true
    })),
    on(FormActions.resetClickResetButton, state => ({
        ...state,
        isClickResetButton: initialState.isClickResetButton
    })),
    on(FormActions.resetClickSaveButton, state => ({
        ...state,
        isClickSaveButton: false
    })),
    on(FormActions.setCancelButtonAction, (state, { payload }) => ({
        ...state,
        cancelButtonAction: payload ? payload.trim().toUpperCase() : payload
    })),
    on(FormActions.resetCancelButtonAction, state => ({
        ...state,
        cancelButtonAction: initialState.cancelButtonAction
    }))
);

export function reducer(state: State | undefined, action: Action): State {
    return formReducer(state, action);
}
