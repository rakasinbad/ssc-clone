import { Action, combineReducers } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

import * as fromTemperatureErrs from './error.reducer';
import * as fromTemperatures from './temperature.reducer';

// Keyname for core reducer
const featureKey = 'temperatures';

/**
 *
 * Main interface for core reducer
 * @interface State
 */
interface State {
    [fromTemperatureErrs.featureKey]: fromTemperatureErrs.State;
    [fromTemperatures.featureKey]: fromTemperatures.State;
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
        [fromTemperatureErrs.featureKey]: fromTemperatureErrs.reducer,
        [fromTemperatures.featureKey]: fromTemperatures.reducer
    })(state, action);
}

// Set anything for the export
export { featureKey, FeatureState, reducers, State };
