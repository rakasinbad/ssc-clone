import { combineReducers, Action } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

import * as fromWarehousesErrs from './error.reducer';
import * as fromWarehouseCoverages from './warehouse-coverage.reducer';

// Keyname for core reducer
export const featureKey = 'warehouseCoverages';

/**
 *
 * Main interface for core reducer
 * @interface State
 */
export interface State {
    [fromWarehouseCoverages.featureKey]: fromWarehouseCoverages.State;
    [fromWarehousesErrs.featureKey]: fromWarehousesErrs.State;
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
        [fromWarehouseCoverages.featureKey]: fromWarehouseCoverages.reducer,
        [fromWarehousesErrs.featureKey]: fromWarehousesErrs.reducer
    })(state, action);
}
