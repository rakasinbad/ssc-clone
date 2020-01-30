import { createFeatureSelector, createSelector } from '@ngrx/store';

import {
    fromExport
} from '../reducers';
import { Export } from '../../models';
import { TNullable } from 'app/shared/models';

// Get state from the feature key.
export const getExportState = createFeatureSelector<fromExport.State>(fromExport.featureKey);

export const {
    selectAll: selectAllExports,
    selectEntities: selectExportEntities,
    selectIds: selectExportIds,
    selectTotal: selectExportTotal
} = fromExport.adapterExport.getSelectors();

export const getExportEntity = createSelector(
    getExportState,
    state => state.entities
);

export const getExportEntityIds = createSelector(
    getExportState,
    selectExportIds
);

export const getTotalExportEntity = createSelector(
    getExportState,
    selectExportTotal
);

export const getTotalExports = createSelector(
    getExportEntity,
    state => state.total
);

export const getAllExports = createSelector(
    getExportState,
    selectAllExports
);

export const getLoadingState = createSelector(
    getExportEntity,
    state => state.isLoading
);

export const getNeedRefreshState = createSelector(
    getExportEntity,
    state => state.needRefresh
);

export const getExport = createSelector(
    getExportEntity,
    getExportEntityIds,
    (Exports, ids) => (Exports[ids[0]] as TNullable<Export>)
);
