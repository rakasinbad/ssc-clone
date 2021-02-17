import { Action, combineReducers } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

// import * as fromSalesRepErrs from './error.reducer';
import * as fromPromoHierarchy from './promo-hierarchy.reducer';

const featureKey = 'promoHierarchy';

interface State {
    [fromPromoHierarchy.FEATURE_KEY]: fromPromoHierarchy.PromoHierarchyState;
}

interface FeatureState extends fromRoot.State {
    [featureKey]: State;
}

function reducers(state: State | undefined, action: Action): State {
    return combineReducers({
        [fromPromoHierarchy.FEATURE_KEY]: fromPromoHierarchy.reducer,
    })(state, action);
}

export { fromPromoHierarchy, featureKey, FeatureState, reducers, State };
