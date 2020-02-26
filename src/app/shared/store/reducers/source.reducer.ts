import { Action, combineReducers } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

import * as fromPortfolios from './sources/portfolio';
import * as fromWarehouses from './sources/warehouse';
import * as fromTeams from './sources/team';

// Keyname for core reducer
const featureKey = 'sources';

/**
 *
 * Main interface for core reducer
 * @interface State
 */
interface State {
    [fromPortfolios.featureKey]: fromPortfolios.State;
    [fromTeams.featureKey]: fromTeams.State;
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
        [fromPortfolios.featureKey]: fromPortfolios.reducers,
        [fromWarehouses.featureKey]: fromWarehouses.reducers,
        [fromTeams.featureKey]: fromTeams.reducers
    })(state, action);
}

// Set anything for the export
export { featureKey, FeatureState, reducers, State };
