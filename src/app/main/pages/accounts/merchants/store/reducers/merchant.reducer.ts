import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler, TSource } from 'app/shared/models';
import * as fromRoot from 'app/store/app.reducer';

import { IMerchantDemo, IStoreEmployeeDemo } from '../../models';
import { StoreActions } from '../actions';

export const FEATURE_KEY = 'stores';

interface StoreState extends EntityState<IMerchantDemo> {
    total: number;
}

interface StoreEmployeeState extends EntityState<IStoreEmployeeDemo> {
    total: number;
}

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
    isLoading: boolean;
    selectedStoreId: string | number;
    source: TSource;
    stores: StoreState;
    employees: StoreEmployeeState;
    errors: ErrorState;
}

const adapterStore = createEntityAdapter<IMerchantDemo>({
    selectId: store => store.id
});
const initialStoreState = adapterStore.getInitialState({ total: 0 });

const adapterStoreEmployee = createEntityAdapter<IStoreEmployeeDemo>({
    selectId: employee => employee.id
});
const initialStoreEmployeeState = adapterStoreEmployee.getInitialState({ total: 0 });

const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

export const initialState: State = {
    isLoading: false,
    selectedStoreId: null,
    source: 'fetch',
    stores: initialStoreState,
    employees: initialStoreEmployeeState,
    errors: initialErrorState
};

const storeReducer = createReducer(
    initialState,
    on(StoreActions.generateStoresDemo, (state, { payload }) => ({
        ...state,
        stores: adapterStore.addAll(payload, state.stores)
    })),
    on(StoreActions.getStoreDemoDetail, (state, { payload }) => ({
        ...state,
        selectedStoreId: payload
    })),
    on(StoreActions.generateStoreEmployeesDemo, (state, { payload }) => ({
        ...state,
        employees: adapterStoreEmployee.addAll(payload, state.employees)
    }))
);

export function reducer(state: State | undefined, action: Action): State {
    return storeReducer(state, action);
}

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

const getListStoreState = (state: State) => state.stores;
const getListStoreEmployeeState = (state: State) => state.employees;

export const {
    selectAll: selectAllStores,
    selectEntities: selectStoreEntities,
    selectIds: selectStoreIds,
    selectTotal: selectStoresTotal
} = adapterStore.getSelectors(getListStoreState);

export const {
    selectAll: selectAllStoreEmployees,
    selectEntities: selectStoreEmployeeEntities,
    selectIds: selectStoreEmployeeIds,
    selectTotal: selectStoreEmployeesTotal
} = adapterStoreEmployee.getSelectors(getListStoreEmployeeState);
