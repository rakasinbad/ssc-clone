import { InjectionToken } from '@angular/core';
import { getSelectors, routerReducer, RouterReducerState } from '@ngrx/router-store';
import {
    ActionReducer,
    ActionReducerMap,
    createFeatureSelector,
    createSelector,
    MetaReducer
} from '@ngrx/store';
import { AuthActions } from 'app/main/pages/core/auth/store/actions';
import {
    fromDropdown,
    fromForm,
    fromNetwork,
    fromProgress,
    fromSource,
    fromUi
} from 'app/shared/store/reducers';
import { environment } from 'environments/environment';
import { storeFreeze } from 'ngrx-store-freeze';

import * as fromAuth from '../main/pages/core/auth/store/reducers/auth.reducer';
import { RouterStateUrl } from './custom-serializer';

export interface State {
    router: RouterReducerState<RouterStateUrl>;
    [fromAuth.FEATURE_KEY]: fromAuth.State;
    [fromDropdown.FEATURE_KEY]: fromDropdown.State;
    [fromForm.FEATURE_KEY]: fromForm.State;
    [fromNetwork.FEATURE_KEY]: fromNetwork.State;
    [fromProgress.FEATURE_KEY]: fromProgress.State;
    [fromSource.featureKey]: fromSource.State;
    [fromUi.FEAUTURE_KEY]: fromUi.State;
}

export const appReducer = new InjectionToken<ActionReducerMap<State>>('Root Reducer', {
    factory: () => ({
        router: routerReducer,
        [fromAuth.FEATURE_KEY]: fromAuth.reducer,
        [fromDropdown.FEATURE_KEY]: fromDropdown.reducer,
        [fromForm.FEATURE_KEY]: fromForm.reducer,
        [fromNetwork.FEATURE_KEY]: fromNetwork.reducer,
        [fromProgress.FEATURE_KEY]: fromProgress.reducer,
        [fromSource.featureKey]: fromSource.reducers,
        [fromUi.FEAUTURE_KEY]: fromUi.reducer
    })
});

export function logger(reducer: ActionReducer<State>): ActionReducer<State> {
    return (state, action) => {
        const result = reducer(state, action);

        // console.groupCollapsed(action.type);
        // console.log('prev state', state);
        // console.log('action', action);
        // console.log('next state', result);
        // console.groupEnd();

        return result;
    };
}

export function clearState(reducer: ActionReducer<State>): ActionReducer<State> {
    return (state, action) => {
        if (action.type === AuthActions.authLogout.type) {
            state = undefined;
        }

        return reducer(state, action);
    };
}

export const metaReducers: MetaReducer<State>[] =
    !environment.production && !environment.staging
        ? [logger, storeFreeze, clearState]
        : [clearState];

export const getRouterState = createFeatureSelector<RouterReducerState<RouterStateUrl>>('router');
export const {
    selectQueryParams,
    selectRouteParams,
    selectRouteData,
    selectCurrentRoute,
    selectUrl
} = getSelectors(getRouterState);

export const getCurrentUrl = createSelector(
    getRouterState,
    state => state && state.state && state.state.url
);

export const getParams = createSelector(
    getRouterState,
    state => state && state.state && state.state.params
);
