import { Action, combineReducers } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

import * as fromJourneyPlanErrs from './error.reducer';
import * as fromJourneyPlanSales from './journey-plan-sales.reducer';
import * as fromJourneyPlanStoresSelected from './journey-plan-store-selected.reducer';
import * as fromJourneyPlanStoresSource from './journey-plan-store.reducer';
import * as fromJourneyPlans from './journey-plan.reducer';

// Keyname for core reducer
const featureKey = 'journeyPlans';

/**
 *
 * Main interface for core reducer
 * @interface State
 */
interface State {
    [fromJourneyPlanErrs.featureKey]: fromJourneyPlanErrs.State;
    [fromJourneyPlans.featureKey]: fromJourneyPlans.State;
    [fromJourneyPlanSales.featureKey]: fromJourneyPlanSales.State;
    [fromJourneyPlanStoresSelected.featureKey]: fromJourneyPlanStoresSelected.State;
    [fromJourneyPlanStoresSource.featureKey]: fromJourneyPlanStoresSource.State;
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
        [fromJourneyPlanErrs.featureKey]: fromJourneyPlanErrs.reducer,
        [fromJourneyPlans.featureKey]: fromJourneyPlans.reducer,
        [fromJourneyPlanSales.featureKey]: fromJourneyPlanSales.reducer,
        [fromJourneyPlanStoresSelected.featureKey]: fromJourneyPlanStoresSelected.reducer,
        [fromJourneyPlanStoresSource.featureKey]: fromJourneyPlanStoresSource.reducer
    })(state, action);
}

// Set anything for the export
export { featureKey, FeatureState, reducers, State };
