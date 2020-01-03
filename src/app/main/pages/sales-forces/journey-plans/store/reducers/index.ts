import { Action, combineReducers } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

import * as fromJourneyPlanErrs from './error.reducer';
import * as fromJourneyPlans from './journey-plan.reducer';

// Keyname for core reducer
const featureKey = 'journeyPlans';

/**
 *
 * Main interface for core reducer
 * @interface State
 */
interface State {
    [fromJourneyPlans.featureKey]: fromJourneyPlans.State;
    [fromJourneyPlanErrs.featureKey]: fromJourneyPlanErrs.State;
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
        [fromJourneyPlans.featureKey]: fromJourneyPlans.reducer,
        [fromJourneyPlanErrs.featureKey]: fromJourneyPlanErrs.reducer
    })(state, action);
}

// Set anything for the export
export { featureKey, FeatureState, reducers, State };
