import { Action, combineReducers } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

// import * as fromSalesRepErrs from './error.reducer';
import * as fromAssociations from './association.reducer';
import * as fromAssociationStores from './association-store.reducer';

const featureKey = 'associations';

interface State {
    [fromAssociations.featureKey]: fromAssociations.State;
    [fromAssociationStores.featureKey]: fromAssociationStores.State;
}

interface FeatureState extends fromRoot.State {
    [featureKey]: State;
}

function reducers(state: State | undefined, action: Action): State {
    return combineReducers({
        [fromAssociations.featureKey]: fromAssociations.reducer,
        [fromAssociationStores.featureKey]: fromAssociationStores.reducer
    })(state, action);
}

export { featureKey, FeatureState, reducers, State };
