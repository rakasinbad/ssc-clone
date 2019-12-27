import { Action, combineReducers } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

import * as fromPortfolios from './portfolios.reducer';
import * as fromErrors from './error.reducer';
import * as fromStore from './stores.reducer';

const mainFeatureKey = fromPortfolios.featureKey;

interface CoreState {
    [mainFeatureKey]: fromPortfolios.State;
    [fromErrors.featureKey]: fromErrors.State;
    [fromStore.featureKey]: fromStore.State;
}

interface CoreFeatureState extends fromRoot.State {
    [mainFeatureKey]: CoreState;
}

function reducers(state: CoreState | undefined, action: Action): CoreState {
    return combineReducers({
        [mainFeatureKey]: fromPortfolios.reducer,
        [fromErrors.featureKey]: fromErrors.reducer,
        [fromStore.featureKey]: fromStore.reducer,
    })(state, action);
}

export {
    mainFeatureKey,
    CoreFeatureState,
    reducers,
    fromPortfolios,
    fromErrors,
    fromStore,
    CoreState
};
