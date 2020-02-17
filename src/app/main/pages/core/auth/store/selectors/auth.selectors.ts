import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromAuth } from '../reducers';

export const getAuthState = createFeatureSelector<fromAuth.State>(fromAuth.FEATURE_KEY);

// -----------------------------------------------------------------------------------------------------
// User State
// -----------------------------------------------------------------------------------------------------

export const getUserState = createSelector(getAuthState, state => state.user);

export const getUserDataState = createSelector(
    getAuthState,
    state => state.user && state.user.user
);

export const getIsAuth = createSelector(getAuthState, state => !!state.user.token);

// -----------------------------------------------------------------------------------------------------
// User Suppliers State
// -----------------------------------------------------------------------------------------------------

export const getUserSuppliers = createSelector(getUserState, state =>
    state && state.user ? state.user.userSuppliers : []
);

// -----------------------------------------------------------------------------------------------------
// User Supplier State
// -----------------------------------------------------------------------------------------------------

export const getUserSupplier = createSelector(getUserSuppliers, state =>
    state && state.length > 0 ? state[0] : null
);

// -----------------------------------------------------------------------------------------------------
// Helper State
// -----------------------------------------------------------------------------------------------------

export const getIsLoading = createSelector(getAuthState, state => state.isLoading);
