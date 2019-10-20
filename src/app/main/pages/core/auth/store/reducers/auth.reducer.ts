import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler } from 'app/shared/models';
import * as fromRoot from 'app/store/app.reducer';

import { Auth } from '../../models';
import { AuthActions } from '../actions';

export const FEATURE_KEY = 'auth';

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
    isLoading: boolean;
    user: Auth;
    errors: ErrorState;
}

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State;
}

const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

export const initialState: State = {
    isLoading: false,
    user: null,
    errors: initialErrorState
};

const authReducer = createReducer(
    initialState,
    on(AuthActions.authLoginRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(AuthActions.authLoginFailure, (state, { payload }) => ({
        ...state,
        isLoading: false,
        user: undefined,
        errors: adapterError.upsertOne(payload, state.errors)
    })),
    on(AuthActions.authLoginSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        user: payload,
        errors: adapterError.removeOne('authLoginFailure', state.errors)
    })),
    on(AuthActions.authLogout, state => ({
        ...state,
        user: undefined,
        errors: adapterError.removeAll(state.errors)
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
