import { Action, combineReducers } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

import * as fromSalesRepErrs from './error.reducer';
import * as fromSalesReps from './sales-rep.reducer';

const featureKey = 'salesReps';

interface State {
    [fromSalesReps.featureKey]: fromSalesReps.State;
    [fromSalesRepErrs.featureKey]: fromSalesRepErrs.State;
}

interface FeatureState extends fromRoot.State {
    [featureKey]: State;
}

function reducers(state: State | undefined, action: Action): State {
    return combineReducers({
        [fromSalesReps.featureKey]: fromSalesReps.reducer,
        [fromSalesRepErrs.featureKey]: fromSalesRepErrs.reducer
    })(state, action);
}

export { featureKey, FeatureState, reducers, State };
