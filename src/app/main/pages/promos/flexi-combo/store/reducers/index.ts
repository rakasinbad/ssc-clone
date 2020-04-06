import { Action, combineReducers } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

// import * as fromSalesRepErrs from './error.reducer';
import * as fromFlexiCombo from './flexi-combo.reducer';
import * as fromFlexiComboList from './flexi-combo-list.reducer';

const featureKey = 'flexiCombo';

interface State {
    [fromFlexiCombo.FEATURE_KEY]: fromFlexiCombo.FlexiComboState;
    [fromFlexiComboList.featureKey]: fromFlexiComboList.State;
}

interface FeatureState extends fromRoot.State {
    [featureKey]: State;
}

function reducers(state: State | undefined, action: Action): State {
    return combineReducers({
        [fromFlexiCombo.FEATURE_KEY]: fromFlexiCombo.reducer,
        [fromFlexiComboList.featureKey]: fromFlexiComboList.reducer
    })(state, action);
}

export { fromFlexiCombo, fromFlexiComboList, featureKey, FeatureState, reducers, State };
