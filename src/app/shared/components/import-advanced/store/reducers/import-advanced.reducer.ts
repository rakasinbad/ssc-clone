import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models';
import * as fromRoot from 'app/store/app.reducer';

import { ExportLog, IConfigImportAdvanced, ImportLog } from '../../models';
import { ImportAdvancedActions, ImportHistroyActions, TemplateHistroyActions } from '../actions';

// Keyname for reducer
export const featureKey = 'importAdvanced';

interface ImportLogState extends EntityState<ImportLog> {
    isRefresh: boolean;
    selectedId: string;
    total: number;
}

interface TemplateLogState extends EntityState<ExportLog> {
    isRefresh: boolean;
    selectedId: string;
    total: number;
}

/**
 *
 *
 * @export
 * @interface State
 */
export interface State {
    isLoading: boolean;
    errors: ErrorHandler;
    config: IConfigImportAdvanced;
    importLogs: ImportLogState;
    templateLogs: TemplateLogState;
}

// Adapter for importLogs state
export const adapterImportLogs = createEntityAdapter<ImportLog>({ selectId: row => row.id });

// Initialize state
const initialImportLogs = adapterImportLogs.getInitialState<
    Omit<ImportLogState, 'ids' | 'entities'>
>({
    isRefresh: undefined,
    selectedId: null,
    total: 0
});

// Adapter for templateLogs state
export const adapterTemplateLogs = createEntityAdapter<ExportLog>({ selectId: row => row.id });

// Initialize state
const initialExportLogs = adapterTemplateLogs.getInitialState<
    Omit<TemplateLogState, 'ids' | 'entities'>
>({
    isRefresh: undefined,
    selectedId: null,
    total: 0
});

/**
 *
 *
 * @export
 * @interface FeatureState
 * @extends {fromRoot.State}
 */
export interface FeatureState extends fromRoot.State {
    [featureKey]: State | undefined;
}

// Initialize state
export const initialState: State = {
    isLoading: false,
    errors: undefined,
    config: undefined,
    importLogs: initialImportLogs,
    templateLogs: initialExportLogs
};

// Reducer manage the action
const importAdvancedReducer = createReducer(
    initialState,
    on(
        ImportAdvancedActions.importConfigRequest,
        ImportHistroyActions.importHistoryRequest,
        TemplateHistroyActions.templateHistoryRequest,
        state => ({
            ...state,
            isLoading: true
        })
    ),
    on(
        ImportAdvancedActions.importConfigFailure,
        ImportHistroyActions.importHistoryFailure,
        TemplateHistroyActions.templateHistoryFailure,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            errors: payload
        })
    ),
    on(ImportAdvancedActions.importConfigSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        errors: initialState.errors,
        config: payload
    })),
    on(ImportHistroyActions.importHistorySuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        errors: initialState.errors,
        importLogs: adapterImportLogs.addAll(payload.data, {
            ...state.importLogs,
            total: payload.total
        })
    })),
    on(TemplateHistroyActions.templateHistorySuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        errors: initialState.errors,
        templateLogs: adapterTemplateLogs.addAll(payload.data, {
            ...state.templateLogs,
            total: payload.total
        })
    })),
    on(ImportAdvancedActions.resetImportConfig, state => ({
        ...state,
        config: initialState.config
    })),
    on(ImportHistroyActions.resetImportHistory, state => ({
        ...state,
        importLogs: initialState.importLogs
    })),
    on(TemplateHistroyActions.resetTemplateHistory, state => ({
        ...state,
        templateLogs: initialState.templateLogs
    }))
);

/**
 *
 *
 * @export
 * @param {*} [state=initialState || undefined]
 * @param {Action} action
 * @returns {State}
 */
export function reducer(state = initialState || undefined, action: Action): State {
    return importAdvancedReducer(state, action);
}
