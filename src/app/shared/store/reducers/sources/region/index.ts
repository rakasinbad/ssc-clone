import { Action, combineReducers } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

import * as fromRegionErrs from './error.reducer';
import * as fromRegion from './region.reducer';

// Keyname for core reducer
const featureKey = 'region';

/**
 *
 * Main interface for core reducer
 * @interface State
 */
interface State {
    [fromRegionErrs.featureKey]: fromRegionErrs.State;
    [fromRegion.featureKey]: fromRegion.State;
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
        [fromRegionErrs.featureKey]: fromRegionErrs.reducer,
        [fromRegion.featureKey]: fromRegion.reducer,
    })(state, action);
}

// Set anything for the export
export { featureKey, FeatureState, reducers, State };
