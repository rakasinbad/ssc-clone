import { Action, combineReducers } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';
import * as fromAvailableSupplierStore from './data-available-supplier-store.reducer';

export const FEATURE_KEY = 'availableSupplierStore';

export interface State {
    [fromAvailableSupplierStore.FEATURE_KEY]: fromAvailableSupplierStore.State;
}

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

export function reducers(state: State | undefined, action: Action): State {
    return combineReducers({
        [fromAvailableSupplierStore.FEATURE_KEY]: fromAvailableSupplierStore.reducer,
    })(state, action);
}
