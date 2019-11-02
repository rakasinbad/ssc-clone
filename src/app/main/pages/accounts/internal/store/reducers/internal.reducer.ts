import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler, TSource } from 'app/shared/models';
import * as fromRoot from 'app/store/app.reducer';

import { InternalEmployee } from '../../models';
import { InternalActions } from '../actions';

export const FEATURE_KEY = 'internals';

interface InternalEmployeeState extends EntityState<InternalEmployee> {
    total: number;
}

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
    isDeleting: boolean | undefined;
    isLoading: boolean;
    selectedInternalEmployeeId: string | number;
    source: TSource;
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
    isDeleting: undefined,
    isLoading: false,
    selectedInternalEmployeeId: null,
    source: 'fetch',
    internalEmployees: initialInternalEmployeeState,
    errors: initialErrorState
};

const internalReducer = createReducer(
    initialState,
    on(InternalActions.fetchInternalEmployeesRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(InternalActions.fetchInternalEmployeesFailure, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isDeleting: initialState.isDeleting,
        errors: adapterError.upsertOne(payload, state.errors)
    })),
    on(InternalActions.fetchInternalEmployeesSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isDeleting: initialState.isDeleting,
        internalEmployees: adapterInternalEmployee.addAll(payload.internalEmployees, {
            ...state.internalEmployees,
            total: payload.total
        }),
        errors: adapterError.removeOne('fetchInternalEmployeesFailure', state.errors)
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
