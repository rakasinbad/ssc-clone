import { Action, combineReducers } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

import * as fromPromoHierarchy from './promo-hierarchy.reducer';

// Keyname for core reducer
export const featureKey = 'promoHierarchy';

/**
 *
 * Main interface for core reducer
 * @interface State
 */
export interface State {
    [fromPromoHierarchy.featureKey]: fromPromoHierarchy.PromoHierarchyState;
}

/**
 *
 * Main interface global for core reducer
 * @export
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
        [fromPromoHierarchy.featureKey]: fromPromoHierarchy.reducer,
    })(state, action);
}
