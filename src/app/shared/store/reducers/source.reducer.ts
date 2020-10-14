import { Action, combineReducers } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';
import * as fromPortfolios from './sources/portfolio';
import * as fromStockManagementReasons from './sources/stock-management-reason';
import * as fromTeams from './sources/team';
import * as fromTemperatures from './sources/temperature';
import * as fromWarehouses from './sources/warehouse';
import * as fromWarehouseValues from './sources/warehouse-value';

// Keyname for core reducer
const featureKey = 'sources';

/**
 *
 * Main interface for core reducer
 * @interface State
 */
interface State {
    [fromPortfolios.featureKey]: fromPortfolios.State;
    [fromStockManagementReasons.featureKey]: fromStockManagementReasons.State;
    [fromTeams.featureKey]: fromTeams.State;
    [fromTemperatures.featureKey]: fromTemperatures.State;
    [fromWarehouses.featureKey]: fromWarehouses.State;
    [fromWarehouseValues.featureKey]: fromWarehouseValues.State;
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
        [fromStockManagementReasons.featureKey]: fromStockManagementReasons.reducers,
        [fromTeams.featureKey]: fromTeams.reducers,
        [fromTemperatures.featureKey]: fromTemperatures.reducers,
        [fromWarehouses.featureKey]: fromWarehouses.reducers,
        [fromWarehouseValues.featureKey]: fromWarehouseValues.reducers,
    })(state, action);
}

// Set anything for the export
export { featureKey, FeatureState, reducers, State };
