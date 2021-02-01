import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromImportMassUpload } from '../reducers';


export const getImportAdvancedState = createFeatureSelector<fromImportMassUpload.State>(
    fromImportMassUpload.featureKey
);

export const getImportLogsState = createSelector(getImportAdvancedState, state => state.importLogs);

export const {
    selectAll: selectAllImportLogs,
    selectEntities: selectEntitiesImportLogs,
    selectIds: selectIdsImportLogs,
    selectTotal: selectTotalImportLogs
} = fromImportMassUpload.adapterImportLogs.getSelectors(getImportLogsState);

// export const getTemplateLogsState = createSelector(
//     getImportAdvancedState,
//     state => state.templateLogs
// );

// export const {
//     selectAll: selectAllTemplateLogs,
//     selectEntities: selectEntitiesTemplateLogs,
//     selectIds: selectIdsTemplateLogs,
//     selectTotal: selectTotalTemplateLogs
// } = fromImportAdvanced.adapterTemplateLogs.getSelectors(getTemplateLogsState);

export const getConfig = createSelector(getImportAdvancedState, state => state.config);

// export const getMode = createSelector(getConfig, state => state && state.mode);

// export const getTemplate = createSelector(getConfig, state => state && state.template);

export const getTotalImportLogs = createSelector(getImportLogsState, state => state.total);

// export const getTotalTemplateLogs = createSelector(getTemplateLogsState, state => state.total);

export const getIsLoading = createSelector(getImportAdvancedState, state => state.isLoading);

// export const getIsDownload = createSelector(getImportAdvancedState, state => state.isDownload);
