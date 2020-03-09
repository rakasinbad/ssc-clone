import { Action, combineReducers } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

import * as fromStockManagementReasonErrs from './error.reducer';
import * as fromStockManagementReasons from './stock-management-reason.reducer';

// Keyname for core reducer
const featureKey = 'stockManagementReasons';

/**
 *
 * Main interface for core reducer
 * @interface State
 */
interface State {
    [fromStockManagementReasonErrs.featureKey]: fromStockManagementReasonErrs.State;
    [fromStockManagementReasons.featureKey]: fromStockManagementReasons.State;
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
        [fromStockManagementReasonErrs.featureKey]: fromStockManagementReasonErrs.reducer,
        [fromStockManagementReasons.featureKey]: fromStockManagementReasons.reducer
    })(state, action);
}

// Set anything for the export
export { featureKey, FeatureState, reducers, State };
