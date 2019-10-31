import { state } from '@angular/animations';
import { InjectionToken } from '@angular/core';
import { getSelectors, routerReducer, RouterReducerState } from '@ngrx/router-store';
import {
    ActionReducer,
    ActionReducerMap,
    createFeatureSelector,
    createSelector,
    MetaReducer
} from '@ngrx/store';
import { fromDropdown, fromForm, fromNetwork, fromUi } from 'app/shared/store/reducers';
import { environment } from 'environments/environment';
import { storeFreeze } from 'ngrx-store-freeze';

import * as fromAuth from '../main/pages/core/auth/store/reducers/auth.reducer';
import { RouterStateUrl } from './custom-serializer';

export interface State {
    router: RouterReducerState<RouterStateUrl>;
    [fromDropdown.FEATURE_KEY]: fromDropdown.State;
    [fromForm.FEATURE_KEY]: fromForm.State;
    [fromNetwork.FEATURE_KEY]: fromNetwork.State;
    [fromUi.FEAUTURE_KEY]: fromUi.State;
    [fromAuth.FEATURE_KEY]: fromAuth.State;
}

export const appReducer = new InjectionToken<ActionReducerMap<State>>('Root Reducer', {
    factory: () => ({
        router: routerReducer,
        [fromDropdown.FEATURE_KEY]: fromDropdown.reducer,
        [fromForm.FEATURE_KEY]: fromForm.reducer,
        [fromNetwork.FEATURE_KEY]: fromNetwork.reducer,
        [fromUi.FEAUTURE_KEY]: fromUi.reducer,
        [fromAuth.FEATURE_KEY]: fromAuth.reducer
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

export const metaReducers: MetaReducer<State>[] = !environment.production
    ? [logger, storeFreeze]
    : [];

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
