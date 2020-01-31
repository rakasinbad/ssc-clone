import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromImportAdvanced } from '../reducers';

export const getImportAdvancedState = createFeatureSelector<fromImportAdvanced.State>(
    fromImportAdvanced.featureKey
);

export const getImportLogsState = createSelector(getImportAdvancedState, state => state.importLogs);

export const {
    selectAll: selectAllImportLogs,
    selectEntities: selectEntitiesImportLogs,
    selectIds: selectIdsImportLogs,
    selectTotal: selectTotalImportLogs
} = fromImportAdvanced.adapterImportLogs.getSelectors(getImportLogsState);

export const getTemplateLogsState = createSelector(
    getImportAdvancedState,
    state => state.templateLogs
);

export const {
    selectAll: selectAllTemplateLogs,
    selectEntities: selectEntitiesTemplateLogs,
    selectIds: selectIdsTemplateLogs,
    selectTotal: selectTotalTemplateLogs
} = fromImportAdvanced.adapterTemplateLogs.getSelectors(getTemplateLogsState);

export const getConfig = createSelector(getImportAdvancedState, state => state.config);

export const getMode = createSelector(getConfig, state => state && state.mode);

export const getTemplate = createSelector(getConfig, state => state && state.template);

export const getTotalImportLogs = createSelector(getImportLogsState, state => state.total);

export const getTotalTemplateLogs = createSelector(getTemplateLogsState, state => state.total);

export const getIsLoading = createSelector(getImportAdvancedState, state => state.isLoading);
