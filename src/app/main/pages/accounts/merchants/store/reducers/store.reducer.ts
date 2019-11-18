import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler, TSource } from 'app/shared/models';
import * as fromRoot from 'app/store/app.reducer';

import { Store } from '../../models';
import { StoreActions } from '../actions';

export const FEATURE_KEY = 'stores';

interface StoreState extends EntityState<Store> {
    total: number;
}

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
    isRefresh?: boolean;
    isLoading: boolean;
    goPage: string;
    source: TSource;
    store?: Store;
    stores: StoreState;
    errors: ErrorState;
}

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

const adapterStore = createEntityAdapter<Store>({
    selectId: store => store.id
});
const initialStoreState = adapterStore.getInitialState({ total: 0 });

const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

export const initialState: State = {
    //    isRefresh: undefined,
    isLoading: false,
    goPage: 'info',
    source: 'fetch',
    // brandStore: undefined,
    stores: initialStoreState,
    // employee: undefined,
    errors: initialErrorState
};

const brandStoreReducer = createReducer(
    initialState,
    on(
        StoreActions.createStoreRequest,
        StoreActions.fetchStoreRequest,
        StoreActions.fetchStoresRequest,
        state => ({
            ...state,
            isLoading: true
        })
    ),
    on(
        StoreActions.updateStoreRequest,
        StoreActions.deleteStoreRequest,
        state => ({
            ...state,
            isLoading: true,
            isRefresh: false
        })
    ),
    on(
        StoreActions.createStoreFailure,
        StoreActions.updateStoreFailure,
        StoreActions.fetchStoreFailure,
        StoreActions.fetchStoresFailure,
        StoreActions.deleteStoreFailure,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            isRefresh: undefined,
            errors: adapterError.upsertOne(payload, state.errors)
        })
    ),
    on(StoreActions.createStoreSuccess, (state) => ({
        ...state,
        isLoading: false,
        errors: adapterError.removeOne('createStoreFailure', state.errors)
    })),
    on(StoreActions.updateStoreSuccess, (state) => ({
        ...state,
        isLoading: false,
        errors: adapterError.removeOne('updateStoreFailure', state.errors)
    })),
    on(StoreActions.deleteStoreSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isRefresh: true,
        stores: adapterStore.removeOne(payload, {
            ...state.stores,
            total: state.stores.total - 1
        }),
        errors: adapterError.removeOne('deleteStoreFailure', state.errors)
    })),
    on(StoreActions.fetchStoreSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        store: payload.store,
        errors: adapterError.removeOne('fetchStoreFailure', state.errors)
    })),
    // on(BrandStoreActions.resetBrandStores, state => ({
    //     ...state,
    //     brandStores: initialBrandStoreState,
    //     errors: adapterError.removeOne('fetchBrandStoresFailure', state.errors)
    // })),
    // on(BrandStoreActions.resetBrandStore, state => ({
    //     ...state,
    //     brandStore: initialState.brandStore,
    //     errors: adapterError.removeOne('fetchBrandStoreFailure', state.errors)
    // })),
    // on(BrandStoreActions.resetStoreEmployees, state => ({
    //     ...state,
    //     employees: initialState.employees,
    //     errors: adapterError.removeOne('fetchStoreEmployeesFailure', state.errors)
    // })),
    // on(BrandStoreActions.resetStoreEmployee, state => ({
    //     ...state,
    //     employee: initialState.employee,
    //     errors: adapterError.removeOne('fetchStoreEmployeeFailure', state.errors)
    // })),
    // on(BrandStoreActions.resetGoPage, state => ({
    //     ...state,
    //     goPage: initialState.goPage
    // })),
    // on(BrandStoreActions.goPage, (state, { payload }) => ({
    //     ...state,
    //     goPage: payload
    // }))
);

export function reducer(state: State | undefined, action: Action): State {
    return brandStoreReducer(state, action);
}

const getListStoreState = (state: State) => state.stores;

export const {
    selectAll: selectAllStores,
    selectEntities: selectStoreEntities,
    selectIds: selectStoreIds,
    selectTotal: selectStoresTotal
} = adapterStore.getSelectors(getListStoreState);
