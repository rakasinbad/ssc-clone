import { createFeatureSelector, createSelector } from '@ngrx/store';
import { fromExportHistory } from '../reducers';

// Get state from the feature key.
export const getExportHistoryState = createFeatureSelector<fromExportHistory.State>(fromExportHistory.featureKey);

export const getAllExportHistory = createSelector(getExportHistoryState, state => state.data);

export const getTotalExportHistory = createSelector(getExportHistoryState, state => state.total);

export const getExportPage = createSelector(getExportHistoryState, state => state.exportPage);

export const getIsLoading = createSelector(getExportHistoryState, state => state.isLoading);
