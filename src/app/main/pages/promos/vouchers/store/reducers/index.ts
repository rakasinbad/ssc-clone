import { Action, combineReducers } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';

// import * as fromSalesRepErrs from './error.reducer';
import * as fromVoucher from './voucher.reducer';

const featureKey = 'voucher';

interface State {
    [fromVoucher.FEATURE_KEY]: fromVoucher.SupplierVoucherState;
}

interface FeatureState extends fromRoot.State {
    [featureKey]: State;
}

function reducers(state: State | undefined, action: Action): State {
    return combineReducers({
        [fromVoucher.FEATURE_KEY]: fromVoucher.reducer,
    })(state, action);
}

export { fromVoucher, featureKey, FeatureState, reducers, State };
