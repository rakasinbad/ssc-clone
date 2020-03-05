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
    [fromWarehouseErrs.featureKey]: fromWarehouseErrs.State;
    [fromWarehouses.featureKey]: fromWarehouses.State;
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
        [fromWarehouseErrs.featureKey]: fromWarehouseErrs.reducer,
        [fromWarehouses.featureKey]: fromWarehouses.reducer
    })(state, action);
}

// Set anything for the export
export { featureKey, FeatureState, reducers, State };
