import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromProfile } from '../reducers';

const getProfileState = createFeatureSelector<fromProfile.State>(fromProfile.FEATURE_KEY);

// -----------------------------------------------------------------------------------------------------
// Profile State
// -----------------------------------------------------------------------------------------------------

export const getProfile = createSelector(getProfileState, state => state.profile || null);

// -----------------------------------------------------------------------------------------------------
// Helper State
// -----------------------------------------------------------------------------------------------------

export const getIsRefresh = createSelector(getProfileState, state => state.isRefresh);

export const getIsLoading = createSelector(getProfileState, state => state.isLoading);
