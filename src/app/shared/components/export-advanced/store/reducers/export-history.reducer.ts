import { state } from '@angular/animations';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';

import { ExportHistory } from '../../models';
import { IExportHistoryPage } from '../../models/export-history.model';
import { ExportHistoryActions } from '../actions';

// Set reducer's feature key
export const featureKey = 'exportAdvancedHistory';

// Store's Export
// export const adapterExportHistory: EntityAdapter<ExportHistory> = createEntityAdapter<ExportHistory>({
//     // selectId: item => item.id as string
// });
// export const adapterExportHistory: EntityAdapter<ExportHistory> = createEntityAdapter<ExportHistory>();

// Export
// export interface State extends EntityState<ExportHistory> {
export interface State {
    data: ExportHistory[];
    exportPage: IExportHistoryPage;
    isLoading: boolean;
    total: number;
}

// Set the reducer's initial state.
// export const initialState = adapterExportHistory.getInitialState<Omit<State, 'ids' | 'entities'>>({
export const initialState: State = ({
    data: [],
    exportPage: {
        page: '',
        tab: ''
    },
    isLoading: false,
    total: 0
});

// Create the reducer.
const exportHistoryReducer = createReducer(
    initialState,
    on(ExportHistoryActions.fetchExportHistoryRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(ExportHistoryActions.fetchExportHistoryFailure, state => ({
        ...state,
        isLoading: false
    })),
    on(ExportHistoryActions.fetchExportHistorySuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        data: payload.data,
        total: payload.total
    })),
    on(ExportHistoryActions.resetExportHistory, state => ({
        ...initialState
    })),
    on(ExportHistoryActions.setExportHistoryPage, (state, { payload }) => ({
        ...state,
        exportPage: payload,
    })),
    on(ExportHistoryActions.resetExportHistoryPage, (state) => ({
        ...state,
        exportPage: initialState.exportPage
    })),
);

export function reducer(state: State | undefined = initialState || undefined, action: Action): State {
    return exportHistoryReducer(state, action);
}
