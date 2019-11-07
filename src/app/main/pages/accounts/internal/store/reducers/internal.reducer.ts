import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler, TSource } from 'app/shared/models';
import * as fromRoot from 'app/store/app.reducer';

import { InternalEmployee, InternalEmployeeDetail } from '../../models';
import { InternalActions } from '../actions';

export const FEATURE_KEY = 'internals';

interface InternalEmployeeState extends EntityState<InternalEmployee> {
    total: number;
}

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
    isRefresh?: boolean;
    isLoading: boolean;
    selectedInternalEmployeeId: string | number;
    source: TSource;
    internalEmployee?: InternalEmployeeDetail;
    internalEmployees: InternalEmployeeState;
    errors: ErrorState;
}

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

const adapterInternalEmployee = createEntityAdapter<InternalEmployee>({
    selectId: internalEmployee => internalEmployee.id
});
const initialInternalEmployeeState = adapterInternalEmployee.getInitialState({ total: 0 });

const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

export const initialState: State = {
    //    isRefresh: undefined,
    isLoading: false,
    selectedInternalEmployeeId: null,
    source: 'fetch',
    internalEmployees: initialInternalEmployeeState,
    errors: initialErrorState
};

const internalReducer = createReducer(
    initialState,
    on(
        InternalActions.fetchInternalEmployeeRequest,
        InternalActions.fetchInternalEmployeesRequest,
        state => ({
            ...state,
            isLoading: true
        })
    ),
    on(
        InternalActions.updateStatusInternalEmployeeRequest,
        InternalActions.deleteInternalEmployeeRequest,
        state => ({
            ...state,
            isLoading: true,
            isRefresh: false
        })
    ),
    on(
        InternalActions.fetchInternalEmployeeFailure,
        InternalActions.fetchInternalEmployeesFailure,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            isRefresh: undefined,
            errors: adapterError.upsertOne(payload, state.errors)
        })
    ),
    on(
        InternalActions.updateStatusInternalEmployeeFailure,
        InternalActions.deleteInternalEmployeeFailure,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            isRefresh: true,
            errors: adapterError.upsertOne(payload, state.errors)
        })
    ),
    on(InternalActions.updateStatusInternalEmployeeSuccess, state => ({
        ...state,
        isLoading: false,
        isRefresh: true,
        errors: adapterError.removeOne('updateStatusInternalEmployeeFailure', state.errors)
    })),
    on(InternalActions.deleteInternalEmployeeSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isRefresh: true,
        internalEmployees: adapterInternalEmployee.removeOne(payload, {
            ...state.internalEmployees,
            total: state.internalEmployees.total - 1
        }),
        errors: adapterError.removeOne('deleteInternalEmployeeFailure', state.errors)
    })),
    on(InternalActions.fetchInternalEmployeesSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isRefresh: initialState.isRefresh,
        internalEmployees: adapterInternalEmployee.addAll(payload.internalEmployees, {
            ...state.internalEmployees,
            total: payload.total
        }),
        errors: adapterError.removeOne('fetchInternalEmployeesFailure', state.errors)
    })),
    on(InternalActions.fetchInternalEmployeeSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isRefresh: undefined,
        internalEmployee: payload.internalEmployee,
        errors: adapterError.removeOne('fetchInternalEmployeeFailure', state.errors)
    })),
    on(InternalActions.resetInternalEmployees, state => ({
        ...state,
        internalEmployees: initialState.internalEmployees,
        errors: adapterError.removeOne('fetchInternalEmployeesFailure', state.errors)
    })),
    on(InternalActions.resetInternalEmployee, state => ({
        ...state,
        internalEmployee: undefined,
        errors: adapterError.removeOne('fetchInternalEmployeeFailure', state.errors)
    }))
    // on(InternalActions.generateInternalDemo, (state, { payload }) => ({
    //     ...state,
    //     internals: adapterInternal.addAll(payload, state.internals)
    // })),
    // on(InternalActions.getInternalDemoDetail, (state, { payload }) => ({
    //     ...state,
    //     selectedInternalId: payload
    // }))
);

export function reducer(state: State | undefined, action: Action): State {
    return internalReducer(state, action);
}

const getListInternalEmployeeState = (state: State) => state.internalEmployees;

export const {
    selectAll: selectAllInternalEmployees,
    selectEntities: selectInternalEmployeeEntities,
    selectIds: selectInternalEmployeeIds,
    selectTotal: selectInternalEmployeesTotal
} = adapterInternalEmployee.getSelectors(getListInternalEmployeeState);
