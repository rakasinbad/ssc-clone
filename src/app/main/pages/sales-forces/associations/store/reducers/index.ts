import { Action, combineReducers } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

// import * as fromSalesRepErrs from './error.reducer';
import * as fromAssociations from './association.reducer';
import * as fromAssociationStores from './association-store.reducer';
import * as fromSalesRep from './sales-rep.reducer';
import * as fromAssociatedPortfolio from './associated-portfolio.reducer';
import * as fromAssociatedStore from './associated-store.reducer';
import * as fromStore from './stores.reducer';

const featureKey = 'associations';

interface State {
    [fromAssociations.featureKey]: fromAssociations.State;
    [fromAssociationStores.featureKey]: fromAssociationStores.State;
    [fromSalesRep.featureKey]: fromSalesRep.State;
    [fromAssociatedPortfolio.featureKey]: fromAssociatedPortfolio.State;
    [fromAssociatedStore.featureKey]: fromAssociatedStore.State;
    [fromStore.featureKey]: fromStore.State;
}

interface FeatureState extends fromRoot.State {
    [featureKey]: State;
}

function reducers(state: State | undefined, action: Action): State {
    return combineReducers({
        [fromAssociations.featureKey]: fromAssociations.reducer,
        [fromAssociationStores.featureKey]: fromAssociationStores.reducer,
        [fromSalesRep.featureKey]: fromSalesRep.reducer,
        [fromAssociatedPortfolio.featureKey]: fromAssociatedPortfolio.reducer,
        [fromAssociatedStore.featureKey]: fromAssociatedStore.reducer,
        [fromStore.featureKey]: fromStore.reducer

    })(state, action);
}

export { fromAssociatedStore, fromAssociatedPortfolio, fromStore, featureKey, FeatureState, reducers, State };
