import { Action } from '@ngrx/store';

export const FEATURE_KEY = 'profiles';

export interface State {}

const initialState: State = {};

export function reducer(state = initialState, action: Action): State {
    switch (action.type) {
        default:
            return state;
    }
}
