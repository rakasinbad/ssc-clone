import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromAuth } from '../reducers';

export const getAuthState = createFeatureSelector<fromAuth.State>(fromAuth.FEATURE_KEY);

export const getUserState = createSelector(getAuthState, state => state.user);
export const getUserSuppliers = createSelector(getUserState, state => state.user.userSuppliers);
export const getUserSupplier = createSelector(getUserSuppliers, state =>
    state && state.length > 0 ? state[0] : null
);

export const getIsLoading = createSelector(getAuthState, state => state.isLoading);
