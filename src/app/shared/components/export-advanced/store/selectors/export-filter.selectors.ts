import { createFeatureSelector, createSelector } from '@ngrx/store';
import { fromExportFilter } from '../reducers';

// Get state from the feature key.
export const getExportFilterState = createFeatureSelector<fromExportFilter.State>(fromExportFilter.featureKey);

export const getRequesting = createSelector(getExportFilterState, state => state.isRequesting);

export const getIsError = createSelector(getExportFilterState, state => state.isError);

export const getExportFilter = createSelector(getExportFilterState, state => state.filter);

export const getStatusList = createSelector(getExportFilterState, state => state.statusList);
