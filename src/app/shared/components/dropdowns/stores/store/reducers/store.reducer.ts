import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import * as fromRoot from 'app/store/app.reducer';

// import { ExportLog, IConfigImportAdvanced, ImportLog } from '../../models';
import { IMassUpload, ImportLog, MassUploadResponse, IMassUploadData } from '../../models';

import { ImportMassUpload } from '../actions';

// Keyname for reducer
export const featureKey = 'massUpload';

interface ImportLogState extends EntityState<ImportLog> {
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
// export interface State extends EntityState<FlexiCombo> {
//     isLoading: boolean;
//     isRefresh: boolean;
//     selectedId: string;
//     total: number;
// }

export interface State extends EntityState<IMassUploadData> {
    isLoading: boolean;
    isRefresh: boolean;
    selectedId: string;
    total: number;
    // templateLogs: TemplateLogState;
}

// Adapter for importLogs state
export const adapter = createEntityAdapter<IMassUploadData>({ selectId: row => row.id });

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
export const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    isRefresh: undefined,
    selectedId: null,
    total: 0,
});

// Reducer manage the action
export const importAdvancedReducer = createReducer(
    initialState,
    on(
        ImportMassUpload.importMassRequest,
        state => adapter.removeAll({
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
    on(ImportMassUpload.importMassSuccess, (state, { payload }) =>
    adapter.upsertOne(payload, { ...state, isLoading: false })
),
    on(ImportMassUpload.clearState, () => initialState)
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
