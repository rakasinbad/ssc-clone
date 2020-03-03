import { combineReducers, Action } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

import * as fromStockManagementsErrs from './error.reducer';
import * as fromStockManagements from './stock-management.reducer';

// Keyname for core reducer
export const featureKey = 'stockManagements';

/**
 *
 * Main interface for core reducer
 * @interface State
 */
export interface State {
    [fromStockManagements.featureKey]: fromStockManagements.State;
    [fromStockManagementsErrs.featureKey]: fromStockManagementsErrs.State;
}

/**
 *
 * Main interface global for core reducer
 * @interface FeatureState
 * @extends {fromRoot.State}
 */
export interface FeatureState extends fromRoot.State {
    [featureKey]: State;
}

/**
 *
 * Combine reducers
 * @export
 * @param {(State | undefined)} state
 * @param {Action} action
 * @returns {State}
 */
export function reducers(state: State | undefined, action: Action): State {
    return combineReducers({
        [fromStockManagements.featureKey]: fromStockManagements.reducer,
        [fromStockManagementsErrs.featureKey]: fromStockManagementsErrs.reducer
    })(state, action);
}
