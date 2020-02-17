import { combineReducers, Action } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

import * as fromWarehousesErrs from './error.reducer';
import * as fromWarehouses from './warehouse.reducer';

// Keyname for core reducer
export const featureKey = 'warehouses';

/**
 *
 * Main interface for core reducer
 * @interface State
 */
export interface State {
    [fromWarehouses.featureKey]: fromWarehouses.State;
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
        [fromWarehouses.featureKey]: fromWarehouses.reducer,
        [fromWarehousesErrs.featureKey]: fromWarehousesErrs.reducer
    })(state, action);
}
