import { combineReducers, Action } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

import * as fromWarehousesErrs from './error.reducer';
import * as fromLocation from './location.reducer';
import * as fromWarehouseCoverages from './warehouse-coverage.reducer';
import * as fromWarehouseUrbans from './warehouse-urban.reducer';

// Keyname for core reducer
export const featureKey = 'warehouseCoverages';

/**
 *
 * Main interface for core reducer
 * @interface State
 */
export interface State {
    [fromWarehouseCoverages.featureKey]: fromWarehouseCoverages.State;
    [fromWarehouseUrbans.featureKey]: fromWarehouseUrbans.State;
    [fromWarehousesErrs.featureKey]: fromWarehousesErrs.State;
    [fromLocation.featureKey]: fromLocation.LocationState;
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
        [fromWarehouseUrbans.featureKey]: fromWarehouseUrbans.reducer,
        [fromWarehousesErrs.featureKey]: fromWarehousesErrs.reducer,
        [fromLocation.featureKey]: fromLocation.reducer
    })(state, action);
}
