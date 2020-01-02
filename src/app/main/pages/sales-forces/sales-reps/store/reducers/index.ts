import { Action, combineReducers } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

import * as fromSalesRepErrs from './error.reducer';
import * as fromSalesReps from './sales-rep.reducer';

// Keyname for core reducer
const featureKey = 'salesReps';

/**
 *
 * Main interface for core reducer
 * @interface State
 */
interface State {
    [fromSalesReps.featureKey]: fromSalesReps.State;
    [fromSalesRepErrs.featureKey]: fromSalesRepErrs.State;
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
        [fromSalesReps.featureKey]: fromSalesReps.reducer,
        [fromSalesRepErrs.featureKey]: fromSalesRepErrs.reducer
    })(state, action);
}

// Set anything for the export
export { featureKey, FeatureState, reducers, State };
