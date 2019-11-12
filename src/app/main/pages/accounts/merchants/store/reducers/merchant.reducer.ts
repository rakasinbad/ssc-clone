import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler, TSource } from 'app/shared/models';
import * as fromRoot from 'app/store/app.reducer';

import { BrandStore, StoreEdit, StoreEmployee, StoreEmployeeDetail } from '../../models';
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
    isRefresh?: boolean;
    isLoading: boolean;
    goPage: string;
    selectedBrandStoreId: string | number;
    source: TSource;
    brandStore?: BrandStore;
    brandStores: BrandStoreState;
    editBrandStore?: StoreEdit;
    employee?: StoreEmployeeDetail;
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
    //    isRefresh: undefined,
    isLoading: false,
    goPage: 'info',
    selectedBrandStoreId: null,
    source: 'fetch',
    // brandStore: undefined,
    brandStores: initialBrandStoreState,
    // employee: undefined,
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
        BrandStoreActions.createStoreRequest,
        BrandStoreActions.updateStoreRequest,
        BrandStoreActions.updateStoreEmployeeRequest,
        BrandStoreActions.fetchBrandStoreRequest,
        BrandStoreActions.fetchBrandStoreEditRequest,
        BrandStoreActions.fetchBrandStoresRequest,
        BrandStoreActions.fetchStoreEmployeeRequest,
        BrandStoreActions.fetchStoreEmployeesRequest,
        state => ({
            ...state,
            isLoading: true
        })
    ),
    on(
        BrandStoreActions.updateStatusStoreRequest,
        BrandStoreActions.updateStatusStoreEmployeeRequest,
        BrandStoreActions.deleteStoreRequest,
        BrandStoreActions.deleteStoreEmployeeRequest,
        state => ({
            ...state,
            isLoading: true,
            isRefresh: false
        })
    ),
    on(
        BrandStoreActions.createStoreFailure,
        BrandStoreActions.updateStoreFailure,
        BrandStoreActions.updateStoreEmployeeFailure,
        BrandStoreActions.fetchBrandStoreFailure,
        BrandStoreActions.fetchBrandStoreEditFailure,
        BrandStoreActions.fetchBrandStoresFailure,
        BrandStoreActions.fetchStoreEmployeeFailure,
        BrandStoreActions.fetchStoreEmployeesFailure,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            isRefresh: undefined,
            errors: adapterError.upsertOne(payload, state.errors)
        })
    ),
    on(
        BrandStoreActions.updateStatusStoreFailure,
        BrandStoreActions.updateStatusStoreEmployeeFailure,
        BrandStoreActions.deleteStoreFailure,
        BrandStoreActions.deleteStoreEmployeeFailure,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            isRefresh: true,
            errors: adapterError.upsertOne(payload, state.errors)
        })
    ),
    on(BrandStoreActions.createStoreSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        errors: adapterError.removeOne('createStoreFailure', state.errors)
    })),
    on(BrandStoreActions.updateStoreSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        errors: adapterError.removeOne('updateStoreFailure', state.errors)
    })),
    on(BrandStoreActions.updateStatusStoreSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isRefresh: true,
        errors: adapterError.removeOne('updateStatusStoreFailure', state.errors)
    })),
    on(BrandStoreActions.updateStatusStoreEmployeeSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isRefresh: true,
        errors: adapterError.removeOne('updateStatusStoreEmployeeFailure', state.errors)
    })),
    on(BrandStoreActions.deleteStoreSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isRefresh: true,
        brandStores: adapterBrandStore.removeOne(payload, {
            ...state.brandStores,
            total: state.brandStores.total - 1
        }),
        errors: adapterError.removeOne('deleteStoreFailure', state.errors)
    })),
    on(BrandStoreActions.updateStoreEmployeeSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        errors: adapterError.removeOne('updateStoreEmployeeFailure', state.errors)
    })),
    on(BrandStoreActions.deleteStoreEmployeeSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isRefresh: true,
        employees: adapterStoreEmployee.removeOne(payload, {
            ...state.employees,
            total: state.employees.total - 1
        }),
        errors: adapterError.removeOne('deleteStoreEmployeeFailure', state.errors)
    })),
    on(BrandStoreActions.fetchBrandStoresSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isRefresh: undefined,
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
    on(BrandStoreActions.fetchBrandStoreEditSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        editBrandStore: payload.brandStore,
        errors: adapterError.removeOne('fetchBrandStoreEditFailure', state.errors)
    })),
    on(BrandStoreActions.fetchStoreEmployeesSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isRefresh: undefined,
        employees: adapterStoreEmployee.addAll(payload.employees, {
            ...state.employees,
            total: payload.total
        }),
        errors: adapterError.removeOne('fetchStoreEmployeesFailure', state.errors)
    })),
    on(BrandStoreActions.fetchStoreEmployeeSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isRefresh: undefined,
        employee: payload.employee,
        errors: adapterError.removeOne('fetchStoreEmployeeFailure', state.errors)
    })),
    on(BrandStoreActions.resetBrandStores, state => ({
        ...state,
        brandStores: initialBrandStoreState,
        errors: adapterError.removeOne('fetchBrandStoresFailure', state.errors)
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
