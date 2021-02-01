import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import * as fromRoot from 'app/store/app.reducer';

// import { ExportLog, IConfigImportAdvanced, ImportLog } from '../../models';
import { IMassUpload, ImportLog } from '../../models';

import { ImportMassUpload } from '../actions';

// Keyname for reducer
export const featureKey = 'importAdvanced';

interface ImportLogState extends EntityState<ImportLog> {
    isRefresh: boolean;
    selectedId: string;
    total: number;
}

// interface TemplateLogState extends EntityState<ExportLog> {
//     isRefresh: boolean;
//     selectedId: string;
//     total: number;
// }

/**
 *
 *
 * @export
 * @interface State
 */
export interface State {
    isDownload: boolean;
    isLoading: boolean;
    errors: ErrorHandler;
    config: IMassUpload;
    importLogs: ImportLogState;
    // templateLogs: TemplateLogState;
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
// export const adapterTemplateLogs = createEntityAdapter<ExportLog>({ selectId: row => row.id });

// // Initialize state
// const initialExportLogs = adapterTemplateLogs.getInitialState<
//     Omit<TemplateLogState, 'ids' | 'entities'>
// >({
//     isRefresh: undefined,
//     selectedId: null,
//     total: 0
// });

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
    isDownload: undefined,
    isLoading: false,
    errors: undefined,
    config: undefined,
    importLogs: initialImportLogs,
    // templateLogs: initialExportLogs
};

// Reducer manage the action
const importAdvancedReducer = createReducer(
    initialState,
    on(
        ImportMassUpload.importMassRequest,
        state => ({
            ...state,
            isLoading: true
        })
    ),
    on(
        ImportMassUpload.importMassFailure,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            errors: payload
        })
    ),
    on(ImportMassUpload.importMassSuccess, state => ({
        ...state,
        isLoading: false,
        errors: initialState.errors
    })),
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
