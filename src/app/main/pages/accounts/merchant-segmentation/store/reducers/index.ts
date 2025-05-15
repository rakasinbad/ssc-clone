import { Action, combineReducers } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

import * as fromStoreSegmentsErrs from './error.reducer';
import * as fromMerchantSegmentAlert from './merchant-segment-alert.reducer';
import * as fromMerchantSegmentTreeTable from './merchant-segment-tree-table.reducer';
import * as fromStoreChannels from './store-channel.reducer';
import * as fromStoreClusters from './store-cluster.reducer';
import * as fromStoreGroups from './store-group.reducer';
import * as fromStoreTypes from './store-type.reducer';

// Keyname for core reducer
export const featureKey = 'storeSegments';

/**
 *
 * Main interface for core reducer
 * @interface State
 */
export interface State {
    [fromMerchantSegmentAlert.featureKey]: fromMerchantSegmentAlert.State;
    [fromMerchantSegmentTreeTable.featureKey]: fromMerchantSegmentTreeTable.State;
    [fromStoreChannels.featureKey]: fromStoreChannels.State;
    [fromStoreClusters.featureKey]: fromStoreClusters.State;
    [fromStoreGroups.featureKey]: fromStoreGroups.State;
    [fromStoreSegmentsErrs.featureKey]: fromStoreSegmentsErrs.State;
    [fromStoreTypes.featureKey]: fromStoreTypes.State;
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
        [fromMerchantSegmentAlert.featureKey]: fromMerchantSegmentAlert.reducer,
        [fromMerchantSegmentTreeTable.featureKey]: fromMerchantSegmentTreeTable.reducer,
        [fromStoreChannels.featureKey]: fromStoreChannels.reducer,
        [fromStoreClusters.featureKey]: fromStoreClusters.reducer,
        [fromStoreGroups.featureKey]: fromStoreGroups.reducer,
        [fromStoreSegmentsErrs.featureKey]: fromStoreSegmentsErrs.reducer,
        [fromStoreTypes.featureKey]: fromStoreTypes.reducer
    })(state, action);
}
