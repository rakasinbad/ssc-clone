import { combineReducers, Action } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

import * as fromProvince from './province.reducer';
import * as fromCity from './city.reducer';
import * as fromDistrict from './district.reducer';
import * as fromUrban from './urban.reducer';

// Keyname for core reducer
const featureKey = 'geolocation';

/**
 *
 * Main interface for core reducer
 * @interface State
 */
interface State {
    [fromProvince.featureKey]: fromProvince.State;
    [fromCity.featureKey]: fromCity.State;
    [fromDistrict.featureKey]: fromDistrict.State;
    [fromUrban.featureKey]: fromUrban.State;
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
 * @export
 * @param {(State | undefined)} state
 * @param {Action} action
 * @returns {State}
 */
function reducers(state: State | undefined, action: Action): State {
    return combineReducers({
        [fromProvince.featureKey]: fromProvince.reducer,
        [fromCity.featureKey]: fromCity.reducer,
        [fromDistrict.featureKey]: fromDistrict.reducer,
        [fromUrban.featureKey]: fromUrban.reducer,
    })(state, action);
}

export {
    fromProvince,
    fromCity,
    fromDistrict,
    fromUrban,
    featureKey,
    State,
    FeatureState,
    reducers,
};
