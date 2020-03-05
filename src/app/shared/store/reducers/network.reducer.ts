import { Action, createReducer, on } from '@ngrx/store';

import * as NetworkActions from '../actions/network.actions';

export const FEATURE_KEY = 'networks';

export interface State {
    isOnline: boolean;
}

export const initialState: State = {
    isOnline: navigator.onLine
};

const networkReducer = createReducer(
    initialState,
    on(NetworkActions.setNetworkStatus, (state, { payload }) => ({
        ...state,
        isOnline: payload
    }))
);

export function reducer(state: State | undefined, action: Action): State {
    return networkReducer(state, action);
}
