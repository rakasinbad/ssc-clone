import { Action, combineReducers } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

import * as fromPortfolioErrs from './error.reducer';
import * as fromPortfolios from './portfolio.reducer';

// Keyname for core reducer
const featureKey = 'portfolios';

/**
 *
 * Main interface for core reducer
 * @interface State
 */
interface State {
    [fromPortfolios.featureKey]: fromPortfolios.State;
    [fromPortfolioErrs.featureKey]: fromPortfolioErrs.State;
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
        [fromPortfolios.featureKey]: fromPortfolios.reducer,
        [fromPortfolioErrs.featureKey]: fromPortfolioErrs.reducer
    })(state, action);
}

// Set anything for the export
export { featureKey, FeatureState, reducers, State };
