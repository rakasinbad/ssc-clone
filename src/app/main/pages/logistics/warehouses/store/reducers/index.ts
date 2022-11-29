import { Action, combineReducers } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

import * as fromWarehousesErrs from './error.reducer';
import * as fromWarehouseCoverages from './warehouse-coverage.reducer';
import * as fromWarehouseSkuStocks from './warehouse-sku-stock.reducer';
import * as fromWarehouses from './warehouse.reducer';

// Keyname for core reducer
export const featureKey = 'warehouses';

/**
 *
 * Main interface for core reducer
 * @interface State
 */
export interface State {
    [fromWarehouseCoverages.featureKey]: fromWarehouseCoverages.State;
    [fromWarehouses.featureKey]: fromWarehouses.State;
    [fromWarehousesErrs.featureKey]: fromWarehousesErrs.State;
    [fromWarehouseSkuStocks.featureKey]: fromWarehouseSkuStocks.State;
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
        [fromWarehouseCoverages.featureKey]: fromWarehouseCoverages.reducer,
        [fromWarehouses.featureKey]: fromWarehouses.reducer,
        [fromWarehousesErrs.featureKey]: fromWarehousesErrs.reducer,
        [fromWarehouseSkuStocks.featureKey]: fromWarehouseSkuStocks.reducer
    })(state, action);
}
