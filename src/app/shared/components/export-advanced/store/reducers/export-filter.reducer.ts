import { Action, createReducer, on, } from '@ngrx/store';
import { createEntityAdapter } from '@ngrx/entity';

import { ExportConfiguration } from '../../models';
import { ExportFilterActions } from '../actions';

import { IErrorHandler } from 'app/shared/models/global.model';

// Set reducer's feature key
export const featureKey = 'exportAdvancedFilter';

export interface State {
    filter: Exclude<ExportConfiguration, 'page'>;
    isRequesting: boolean;
    isError: boolean;
    statusList: any;
}

// Set the reducer's initial state.
export const initialState: State = ({
    filter: {
        page: '',
        configuration: {}
    },
    isRequesting: false,
    isError: false,
    statusList: null,
});

const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

// Create the reducer.
const exportFilterReducer = createReducer(
    initialState,
    on(ExportFilterActions.truncateExportFilter, state => ({
        ...state,
        filter: initialState.filter,
        isError: initialState.isError
    })),
    on(
        ExportFilterActions.startExportRequest,
        ExportFilterActions.fetchStatusListRequest, 
        (state, { payload }) => ({
            ...state,
            isRequesting: true,
            isError: false
        })
    ),
    on(
        ExportFilterActions.startExportFailure, 
        ExportFilterActions.fetchStatusListFailure, 
        state => ({
            ...state,
            isRequesting: false,
            isError: true
        })
    ),
    on(ExportFilterActions.startExportSuccess, state => ({
        ...state,
        isRequesting: false,
        isError: false
    })),
    on(ExportFilterActions.fetchStatusListSuccess, (state, { payload }) => ({
        ...state,
        isRequesting: false,
        isError: false,
        statusList: payload
    })),
);

export function reducer(state: State | undefined = initialState || undefined, action: Action): State {
    return exportFilterReducer(state, action);
}
