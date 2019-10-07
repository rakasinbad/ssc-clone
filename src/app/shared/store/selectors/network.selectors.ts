import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromNetwork from '../reducers/network.reducer';

export const selectNetworksState = createFeatureSelector<fromNetwork.State>(
    fromNetwork.FEATURE_KEY
);

export const isNetworkConnected = createSelector(
    selectNetworksState,
    state => state.isOnline
);
