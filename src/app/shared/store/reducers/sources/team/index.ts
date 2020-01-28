import { Action, combineReducers } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

import * as fromTeamErrs from './error.reducer';
import * as fromTeams from './team.reducer';

// Keyname for core reducer
const featureKey = 'teams';

/**
 *
 * Main interface for core reducer
 * @interface State
 */
interface State {
    [fromTeams.featureKey]: fromTeams.State;
    [fromTeamErrs.featureKey]: fromTeamErrs.State;
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
        [fromTeams.featureKey]: fromTeams.reducer,
        [fromTeamErrs.featureKey]: fromTeamErrs.reducer
    })(state, action);
}

// Set anything for the export
export { featureKey, FeatureState, reducers, State };
