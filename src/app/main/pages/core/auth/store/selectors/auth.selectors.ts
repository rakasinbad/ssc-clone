import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromAuth } from '../reducers';

export const getAuthState = createFeatureSelector<fromAuth.State>(fromAuth.FEATURE_KEY);

export const getUserState = createSelector(
    getAuthState,
    state => state.user
);

export const getIsLoading = createSelector(
    getAuthState,
    state => state.isLoading
);
