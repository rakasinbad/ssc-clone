import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler, TSource } from 'app/shared/models';
import * as fromRoot from 'app/store/app.reducer';

import { BrandStore, IStoreEmployeeDemo } from '../../models';
import { BrandStoreActions } from '../actions';

export const FEATURE_KEY = 'brandStores';

interface BrandStoreState extends EntityState<BrandStore> {
    total: number;
}

interface StoreEmployeeState extends EntityState<IStoreEmployeeDemo> {
    total: number;
}

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
    isDeleting: boolean | undefined;
    isLoading: boolean;
    selectedBrandStoreId: string | number;
    source: TSource;
    brandStore: BrandStore | undefined;
    brandStores: BrandStoreState;
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

const adapterStoreEmployee = createEntityAdapter<IStoreEmployeeDemo>({
    selectId: employee => employee.id
});
const initialStoreEmployeeState = adapterStoreEmployee.getInitialState({ total: 0 });

const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

export const initialState: State = {
    isDeleting: undefined,
    isLoading: false,
    selectedBrandStoreId: null,
    source: 'fetch',
    brandStore: undefined,
    brandStores: initialBrandStoreState,
    employees: initialStoreEmployeeState,
    errors: initialErrorState
};

const brandStoreReducer = createReducer(
    initialState,
    on(
        BrandStoreActions.fetchBrandStoreRequest,
        BrandStoreActions.fetchBrandStoresRequest,
        state => ({
            ...state,
            isLoading: true
        })
    ),
    on(
        BrandStoreActions.fetchBrandStoreFailure,
        BrandStoreActions.fetchBrandStoresFailure,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            isDeleting: undefined,
            errors: adapterError.upsertOne(payload, state.errors)
        })
    ),
    on(BrandStoreActions.fetchBrandStoresSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isDeleting: undefined,
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
    on(BrandStoreActions.resetBrandStore, state => ({
        ...state,
        brandStore: initialState.brandStore,
        errors: adapterError.removeOne('fetchBrandStoreFailure', state.errors)
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
