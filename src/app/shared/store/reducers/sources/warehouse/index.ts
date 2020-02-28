import { Action, combineReducers } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

import * as fromWarehouseErrs from './error.reducer';
import * as fromWarehouses from './warehouse.reducer';

// Keyname for core reducer
const featureKey = 'warehouses';

/**
 *
 * Main interface for core reducer
 * @interface State
 */
interface State {
    [fromWarehouses.featureKey]: fromWarehouses.State;
    [fromWarehouseErrs.featureKey]: fromWarehouseErrs.State;
}

/**
 *
 * Main interface global for core reducer
 * @interface FeatureState
 * @extends {fromRoot.State}
 */
interface FeatureState extends fromRoot.State {
    [featureKey]: State;
}

/**
 *
 * Combine reducers
 * @param {(State | undefined)} state
 * @param {Action} action
 * @returns {State}
 */
function reducers(state: State | undefined, action: Action): State {
    return combineReducers({
        [fromWarehouses.featureKey]: fromWarehouses.reducer,
        [fromWarehouseErrs.featureKey]: fromWarehouseErrs.reducer
    })(state, action);
}

// Set anything for the export
export { featureKey, FeatureState, reducers, State };
