import { Action, combineReducers } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

// import * as fromSalesRepErrs from './error.reducer';
import * as fromPeriodTargetPromo from './period-target-promo.reducer';

const featureKey = 'periodTargetPromo';

interface State {
    [fromPeriodTargetPromo.FEATURE_KEY]: fromPeriodTargetPromo.PeriodTargetPromoState;
}

interface FeatureState extends fromRoot.State {
    [featureKey]: State;
}

function reducers(state: State | undefined, action: Action): State {
    return combineReducers({
        [fromPeriodTargetPromo.FEATURE_KEY]: fromPeriodTargetPromo.reducer,
    })(state, action);
}

export { fromPeriodTargetPromo, featureKey, FeatureState, reducers, State };
