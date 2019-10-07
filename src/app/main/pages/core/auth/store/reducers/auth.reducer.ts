import { Action, createReducer, on } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

import { Auth } from '../../models';
import { AuthActions } from '../actions';

export const FEATURE_KEY = 'auth';

export interface State {
    isLoading: boolean;
    user: Auth;
}

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State;
}

export const initialState: State = {
    isLoading: false,
    user: null
};

const authReducer = createReducer(
    initialState,
    on(AuthActions.authLoginRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(AuthActions.authLoginFailure, state => ({
        ...state,
        isLoading: false,
        user: undefined
    })),
    on(AuthActions.authLoginSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        user: payload
    })),
    on(AuthActions.authLogout, state => ({
        ...state,
        user: undefined
    })),
    on(AuthActions.authAutoLoginSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        user: payload
    }))
);

export function reducer(state: State | undefined, action: Action): State {
    return authReducer(state, action);
}
