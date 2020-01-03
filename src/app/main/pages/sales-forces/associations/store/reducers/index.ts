import { Action, combineReducers } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

// import * as fromSalesRepErrs from './error.reducer';
import * as fromAssociations from './association.reducer';

const featureKey = 'associations';

interface State {
    [fromAssociations.featureKey]: fromAssociations.State;
    // [fromSalesRepErrs.featureKey]: fromSalesRepErrs.State;
}

interface FeatureState extends fromRoot.State {
    [featureKey]: State;
}

function reducers(state: State | undefined, action: Action): State {
    return combineReducers({
        [fromAssociations.featureKey]: fromAssociations.reducer
        // [fromSalesRepErrs.featureKey]: fromSalesRepErrs.reducer
    })(state, action);
}

export { featureKey, FeatureState, reducers, State };
