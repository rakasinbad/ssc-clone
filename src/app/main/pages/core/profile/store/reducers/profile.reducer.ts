import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models';
import * as fromRoot from 'app/store/app.reducer';

import { ProfileActions } from '../actions';

export const FEATURE_KEY = 'profiles';

interface ErrorState extends EntityState<ErrorHandler> {}

export interface State {
    isRefresh?: boolean;
    isLoading: boolean;
    profile?: any;
    errors: ErrorState;
}

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

const adapterError = createEntityAdapter<ErrorHandler>();
const initialErrorState = adapterError.getInitialState();

const initialState: State = {
    isLoading: false,
    errors: initialErrorState
};

const profileReducer = createReducer(
    initialState,
    on(ProfileActions.fetchProfileRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(ProfileActions.fetchProfileFailure, (state, { payload }) => ({
        ...state,
        isLoading: false,
        errors: adapterError.upsertOne(payload, state.errors)
    })),
    on(ProfileActions.fetchProfileSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        profile: payload,
        errors: adapterError.removeOne('fetchProfileFailure', state.errors)
    })),
    on(ProfileActions.resetProfile, state => ({
        ...state,
        profile: undefined,
        errors: adapterError.removeOne('fetchProfileFailure', state.errors)
    }))
);

export function reducer(state: State | undefined, action: Action): State {
    return profileReducer(state, action);
}