import { Action, combineReducers } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

import * as fromStockManagementsErrs from './error.reducer';
import * as fromStockManagementCatalogues from './stock-management-catalogue.reducer';
import * as fromStockManagementHistories from './stock-management-history.reducer';
import * as fromStockManagements from './stock-management.reducer';

// Keyname for core reducer
export const featureKey = 'stockManagements';

/**
 *
 * Main interface for core reducer
 * @interface State
 */
export interface State {
    [fromStockManagementCatalogues.featureKey]: fromStockManagementCatalogues.State;
    [fromStockManagementHistories.featureKey]: fromStockManagementHistories.State;
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
        [fromStockManagementCatalogues.featureKey]: fromStockManagementCatalogues.reducer,
        [fromStockManagementHistories.featureKey]: fromStockManagementHistories.reducer,
        [fromStockManagements.featureKey]: fromStockManagements.reducer,
        [fromStockManagementsErrs.featureKey]: fromStockManagementsErrs.reducer
    })(state, action);
}
