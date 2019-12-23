import { Action, combineReducers } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

import * as fromPortfolios from './portfolios.reducer';
import * as fromErrors from './error.reducer';

const mainFeatureKey = fromPortfolios.featureKey;

interface State {
    [mainFeatureKey]: fromPortfolios.State;
    [fromErrors.featureKey]: fromErrors.State;
}

interface FeatureState extends fromRoot.State {
    [mainFeatureKey]: State;
}

function reducers(state: State | undefined, action: Action): State {
    return combineReducers({
        [mainFeatureKey]: fromPortfolios.reducer,
        [fromErrors.featureKey]: fromErrors.reducer,
    })(state, action);
}

export {
    mainFeatureKey,
    FeatureState,
    reducers,
    fromPortfolios,
    fromErrors,
};
