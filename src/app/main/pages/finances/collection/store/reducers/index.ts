import { Action, combineReducers } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

import * as fromCollection from './collection.reducer';
import * as fromBilling from './billing.reducer';
import * as fromCollectionDetail from './collection-detail.reducer';
import * as fromBillingDetail from './billing-detail.reducer';
import * as fromCollectionPhoto from './collection-photo.reducer';
import * as fromCollectionType from './collection-type.reducer';
import * as fromRejectReason from './reject-reason.reducer';

// Keyname for core reducer
export const featureKey = 'collectionMenus';

/**
 *
 * Main interface for core reducer
 * @interface State
 */
export interface State {
    [fromCollection.featureKey]: fromCollection.State;
    [fromBilling.featureKey]: fromBilling.State;
    [fromCollectionDetail.featureKey]: fromCollectionDetail.State;
    [fromBillingDetail.featureKey]: fromBillingDetail.State;
    [fromCollectionPhoto.featureKey]: fromCollectionPhoto.State;
    [fromCollectionType.featureKey]: fromCollectionType.State;
    [fromRejectReason.featureKey]: fromRejectReason.State;
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
        [fromCollection.featureKey]: fromCollection.reducer,
        [fromBilling.featureKey]: fromBilling.reducer,
        [fromBillingDetail.featureKey]: fromBillingDetail.reducer,
        [fromCollectionDetail.featureKey]: fromCollectionDetail.reducer,
        [fromCollectionPhoto.featureKey]: fromCollectionPhoto.reducer,
        [fromCollectionType.featureKey]: fromCollectionType.reducer,
        [fromRejectReason.featureKey]: fromRejectReason.reducer,

    })(state, action);
}
