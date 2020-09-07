import { Action, combineReducers } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

import * as fromAssociations from './association.reducer';
import * as fromPortfolio from './portfolio.reducer';
import * as fromSalesRep from './sales-rep.reducer';
import * as fromStorePortfolio from './store-portfolio.reducer';
import * as fromStore from './store.reducer';

const featureKey = 'sf-associations';

interface State {
    [fromAssociations.featureKey]: fromAssociations.State;
    [fromPortfolio.featureKey]: fromPortfolio.State;
    [fromSalesRep.featureKey]: fromSalesRep.State;
    [fromStorePortfolio.featureKey]: fromStorePortfolio.State;
    [fromStore.featureKey]: fromStore.State;
}

interface FeatureState extends fromRoot.State {
    [featureKey]: State;
}

function reducers(state: State | undefined, action: Action): State {
    return combineReducers({
        [fromAssociations.featureKey]: fromAssociations.reducer,
        [fromPortfolio.featureKey]: fromPortfolio.reducer,
        [fromSalesRep.featureKey]: fromSalesRep.reducer,
        [fromStorePortfolio.featureKey]: fromStorePortfolio.reducer,
        [fromStore.featureKey]: fromStore.reducer,
    })(state, action);
}

export {
    fromAssociations,
    fromPortfolio,
    fromSalesRep,
    fromStorePortfolio,
    fromStore,
    featureKey,
    FeatureState,
    reducers,
    State
};
