import { Action, createReducer, on } from '@ngrx/store';

import { UiActions } from '../actions';

export const FEAUTURE_KEY = 'ui';

export interface State {
    isShowCustomToolbar: boolean;
}

const initialState: State = {
    isShowCustomToolbar: false
};

const uiReducer = createReducer(
    initialState,
    on(UiActions.hideCustomToolbar, state => ({
        ...state,
        isShowCustomToolbar: false
    })),
    on(UiActions.showCustomToolbar, state => ({
        ...state,
        isShowCustomToolbar: true
    }))
);

export function reducer(state: State | undefined, action: Action): State {
    return uiReducer(state, action);
}
