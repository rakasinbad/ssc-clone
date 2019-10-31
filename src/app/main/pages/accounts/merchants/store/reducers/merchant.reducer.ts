import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler, TSource } from 'app/shared/models';
import * as fromRoot from 'app/store/app.reducer';

import { BrandStore, StoreEmployee, StoreEmployeeDetail } from '../../models';
import { BrandStoreActions } from '../actions';

export const FEATURE_KEY = 'brandStores';

interface BrandStoreState extends EntityState<BrandStore> {
    total: number;
}

interface StoreEmployeeState extends EntityState<StoreEmployee> {
    total: number;
}

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
    isDeleting: boolean | undefined;
    isLoading: boolean;
    goPage: string;
    selectedBrandStoreId: string | number;
    source: TSource;
    brandStore: BrandStore | undefined;
    brandStores: BrandStoreState;
    employee: StoreEmployeeDetail | undefined;
    employees: StoreEmployeeState;
    errors: ErrorState;
}

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

const adapterBrandStore = createEntityAdapter<BrandStore>({
    selectId: brandStore => brandStore.id
});
const initialBrandStoreState = adapterBrandStore.getInitialState({ total: 0 });

const adapterStoreEmployee = createEntityAdapter<StoreEmployee>({
    selectId: employee => employee.id
});
const initialStoreEmployeeState = adapterStoreEmployee.getInitialState({ total: 0 });

const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

export const initialState: State = {
    isDeleting: undefined,
    isLoading: false,
    goPage: 'info',
    selectedBrandStoreId: null,
    source: 'fetch',
    brandStore: undefined,
    brandStores: initialBrandStoreState,
    employee: undefined,
    employees: initialStoreEmployeeState,
    errors: initialErrorState
};

const brandStoreReducer = createReducer(
    initialState,
    // on(BrandStoreActions.startLoading, state => ({
    //     ...state,
    //     isLoading: true
    // })),
    // on(BrandStoreActions.endLoading, state => ({
    //     ...state,
    //     isLoading: false
    // })),
    on(
        BrandStoreActions.updateStoreEmployeeRequest,
        BrandStoreActions.fetchBrandStoreRequest,
        BrandStoreActions.fetchBrandStoresRequest,
        BrandStoreActions.fetchStoreEmployeeRequest,
        BrandStoreActions.fetchStoreEmployeesRequest,
        state => ({
            ...state,
            isLoading: true
        })
    ),
    on(
        BrandStoreActions.updateStoreEmployeeFailure,
        BrandStoreActions.fetchBrandStoreFailure,
        BrandStoreActions.fetchBrandStoresFailure,
        BrandStoreActions.fetchStoreEmployeeFailure,
        BrandStoreActions.fetchStoreEmployeesFailure,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            isDeleting: initialState.isDeleting,
            errors: adapterError.upsertOne(payload, state.errors)
        })
    ),
    on(BrandStoreActions.updateStoreEmployeeSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        errors: adapterError.removeOne('updateStoreEmployeeFailure', state.errors)
    })),
    on(BrandStoreActions.fetchBrandStoresSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isDeleting: initialState.isDeleting,
        brandStores: adapterBrandStore.addAll(payload.brandStores, {
            ...state.brandStores,
            total: payload.total
        }),
        errors: adapterError.removeOne('fetchBrandStoresFailure', state.errors)
    })),
    on(BrandStoreActions.fetchBrandStoreSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        brandStore: payload.brandStore,
        errors: adapterError.removeOne('fetchBrandStoreFailure', state.errors)
    })),
    on(BrandStoreActions.fetchStoreEmployeesSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isDeleting: initialState.isDeleting,
        employees: adapterStoreEmployee.addAll(payload.employees, {
            ...state.employees,
            total: payload.total
        }),
        errors: adapterError.removeOne('fetchStoreEmployeesFailure', state.errors)
    })),
    on(BrandStoreActions.fetchStoreEmployeeSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isDeleting: initialState.isDeleting,
        employee: payload.employee,
        errors: adapterError.removeOne('fetchStoreEmployeeFailure', state.errors)
    })),
    on(BrandStoreActions.resetBrandStore, state => ({
        ...state,
        brandStore: initialState.brandStore,
        errors: adapterError.removeOne('fetchBrandStoreFailure', state.errors)
    })),
    on(BrandStoreActions.resetStoreEmployees, state => ({
        ...state,
        employees: initialState.employees,
        errors: adapterError.removeOne('fetchStoreEmployeesFailure', state.errors)
    })),
    on(BrandStoreActions.resetStoreEmployee, state => ({
        ...state,
        employee: initialState.employee,
        errors: adapterError.removeOne('fetchStoreEmployeeFailure', state.errors)
    })),
    on(BrandStoreActions.resetGoPage, state => ({
        ...state,
        goPage: initialState.goPage
    })),
    on(BrandStoreActions.goPage, (state, { payload }) => ({
        ...state,
        goPage: payload
    }))
);

export function reducer(state: State | undefined, action: Action): State {
    return brandStoreReducer(state, action);
}

const getListBrandStoreState = (state: State) => state.brandStores;
const getListStoreEmployeeState = (state: State) => state.employees;

export const {
    selectAll: selectAllBrandStores,
    selectEntities: selectBrandStoreEntities,
    selectIds: selectBrandStoreIds,
    selectTotal: selectBrandStoresTotal
} = adapterBrandStore.getSelectors(getListBrandStoreState);

export const {
    selectAll: selectAllStoreEmployees,
    selectEntities: selectStoreEmployeeEntities,
    selectIds: selectStoreEmployeeIds,
    selectTotal: selectStoreEmployeesTotal
} = adapterStoreEmployee.getSelectors(getListStoreEmployeeState);
