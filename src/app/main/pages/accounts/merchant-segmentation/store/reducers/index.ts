import { Action, combineReducers } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

import * as fromStoreSegmentsErrs from './error.reducer';
import * as fromStoreTypes from './store-type.reducer';

// Keyname for core reducer
export const featureKey = 'storeSegments';

/**
 *
 * Main interface for core reducer
 * @interface State
 */
export interface State {
    [fromStoreTypes.featureKey]: fromStoreTypes.State;
    [fromStoreSegmentsErrs.featureKey]: fromStoreSegmentsErrs.State;
}

/**
 *
 * Main interface global for core reducer
 * @interface FeatureState
 * @extends {fromRoot.State}
 */
export interface FeatureState extends fromRoot.State {
    [featureKey]: State;
}

/**
 *
 * Combine reducers
 * @export
 * @param {(State | undefined)} state
 * @param {Action} action
 * @returns {State}
 */
export function reducers(state: State | undefined, action: Action): State {
    return combineReducers({
        [fromStoreTypes.featureKey]: fromStoreTypes.reducer,
        [fromStoreSegmentsErrs.featureKey]: fromStoreSegmentsErrs.reducer
    })(state, action);
}
