import { Action, createReducer, on } from '@ngrx/store';

import { ExportConfiguration } from '../../models';
import { ExportFilterActions } from '../actions';

// Set reducer's feature key
export const featureKey = 'exportAdvancedFilter';

export interface State {
    filter: Exclude<ExportConfiguration, 'page'>;
    isRequesting: boolean;
    isError: boolean;
}

// Set the reducer's initial state.
export const initialState: State = ({
    filter: {
        page: '',
        configuration: {}
    },
    isRequesting: false,
    isError: false,
});

// Create the reducer.
const exportFilterReducer = createReducer(
    initialState,
    on(ExportFilterActions.truncateExportFilter, state => ({
        ...state,
        filter: initialState.filter,
        isError: initialState.isError
    })),
    on(ExportFilterActions.startExportRequest, (state, { payload }) => ({
        ...state,
        isRequesting: true,
        isError: false
    })),
    on(ExportFilterActions.startExportFailure, state => ({
        ...state,
        isRequesting: false,
        isError: true
    })),
    on(ExportFilterActions.startExportSuccess, state => ({
        ...state,
        isRequesting: false,
        isError: false
    })),
);

export function reducer(state: State | undefined = initialState || undefined, action: Action): State {
    return exportFilterReducer(state, action);
}
