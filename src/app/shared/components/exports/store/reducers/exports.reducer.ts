import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';

import { Export, ExportConfiguration } from '../../models';
import { ExportActions } from '../actions';

// Set reducer's feature key
export const featureKey = 'exports';

// Store's Export
export const adapterExport: EntityAdapter<Export> = createEntityAdapter<Export>({
    selectId: item => item.id as string
});

// Export
export interface State extends EntityState<Export> {
    filter: Exclude<ExportConfiguration, 'page'>;
    exportPage: string;
    isLoading: boolean;
    isRequesting: boolean;
    needRefresh: boolean;
    total: number;
}

// Set the reducer's initial state.
export const initialState = adapterExport.getInitialState<Omit<State, 'ids' | 'entities'>>({
    filter: {
        page: '',
        configuration: {}
    },
    exportPage: '',
    isLoading: false,
    isRequesting: false,
    needRefresh: false,
    total: 0
});

// Create the reducer.
const exportReducer = createReducer(
    initialState,
    on(ExportActions.prepareExportCheck, state => ({
        ...state,
        filter: initialState.filter
    })),
    on(ExportActions.truncateExportFilter, state => ({
        ...state,
        filter: initialState.filter
    })),
    on(ExportActions.startExportRequest, (state, { payload }) => ({
        ...state,
        isRequesting: true,
        exportPage: payload.page
    })),
    on(ExportActions.showExportHistory, (state, { payload }) => ({
        ...state,
        exportPage: payload
    })),
    on(ExportActions.startExportFailure, state => ({
        ...state,
        isRequesting: false
    })),
    on(ExportActions.startExportSuccess, state => ({
        ...state,
        isRequesting: false
    })),
    on(ExportActions.fetchExportLogsRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(ExportActions.fetchExportLogsFailure, state => ({
        ...state,
        isLoading: false
    })),
    on(ExportActions.fetchExportLogsSuccess, (state, { payload }) =>
        adapterExport.upsertMany(payload.data, {
            ...state,
            isLoading: false,
            total: payload.total
        })
    ),
    on(ExportActions.truncateExportLogs, state => adapterExport.removeAll(state))
);

export function reducer(state: State | undefined, action: Action): State {
    return exportReducer(state, action);
}
