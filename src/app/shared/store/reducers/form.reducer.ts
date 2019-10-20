import { Action, createReducer, on } from '@ngrx/store';

import { FormActions } from '../actions';

export const FEATURE_KEY = 'forms';

export interface State {
    isShowSaveButton: boolean;
    isClickSaveButton: boolean;
}

const initialState: State = {
    isShowSaveButton: false,
    isClickSaveButton: false
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
    }))
);

export function reducer(state: State | undefined, action: Action): State {
    return formReducer(state, action);
}
