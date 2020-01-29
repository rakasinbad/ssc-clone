import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler, SupplierStore, TSource, User } from 'app/shared/models';
import * as fromRoot from 'app/store/app.reducer';

import { Store as Merchant, UserStore } from '../../models';
import { StoreActions, StoreSettingActions } from '../actions';
import { StoreSetting } from '../../models/store-setting.model';

export const FEATURE_KEY = 'accountStores';

interface StoreState extends EntityState<SupplierStore> {
    isEditLocation: boolean;
    selectedStoreId: string | number;
    total: number;
}

interface StoreEmployeeState extends EntityState<UserStore> {
    selectedEmployeeId: string | number;
    total: number;
}

interface StoreSettingState extends EntityState<StoreSetting> {
    selectedId: string | number;
    total: number;
}

// interface StoreEmployeeState extends EntityState<StoreEmployee> {
//     total: number;
// }

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
    isRefresh?: boolean;
    isLoading: boolean;
    goPage: string;
    // selectedBrandStoreId: string | number;
    source: TSource;
    stores: StoreState;
    store?: Merchant;
    employees: StoreEmployeeState;
    settings: StoreSettingState;
    employee?: User;
    // brandStore?: BrandStore;
    // brandStores: BrandStoreState;
    // editBrandStore?: StoreEdit;
    // employee?: StoreEmployeeDetail;
    // employees: StoreEmployeeState;
    errors: ErrorState;
}

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

const adapterStoreSetting = createEntityAdapter<StoreSetting>({
    selectId: row => row.id
});
const initialStoreSettingState = adapterStoreSetting.getInitialState<StoreSettingState>({
    total: 0,
    selectedId: null,
    ids: [],
    entities: {},
});

const adapterStore = createEntityAdapter<SupplierStore>({
    selectId: row => row.id
});
const initialStoreState = adapterStore.getInitialState({
    isEditLocation: false,
    selectedStoreId: null,
    total: 0
});

const adapterStoreEmployee = createEntityAdapter<UserStore>({
    selectId: row => row.id
});
const initialStoreEmployeeState = adapterStoreEmployee.getInitialState({
    selectedEmployeeId: null,
    total: 0
});

// const adapterStoreEmployee = createEntityAdapter<StoreEmployee>({
//     selectId: employee => employee.id
// });
// const initialStoreEmployeeState = adapterStoreEmployee.getInitialState({ total: 0 });

const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

export const initialState: State = {
    //    isRefresh: undefined,
    isLoading: false,
    goPage: 'info',
    // selectedBrandStoreId: null,
    source: 'fetch',
    stores: initialStoreState,
    employees: initialStoreEmployeeState,
    settings: initialStoreSettingState,
    // brandStore: undefined,
    // brandStores: initialBrandStoreState,
    // employee: undefined,
    // employees: initialStoreEmployeeState,
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
        // BrandStoreActions.createStoreRequest,
        // BrandStoreActions.updateStoreRequest,
        // BrandStoreActions.updateStoreEmployeeRequest,
        // BrandStoreActions.fetchBrandStoreRequest,
        // BrandStoreActions.fetchBrandStoreEditRequest,
        // BrandStoreActions.fetchBrandStoresRequest,
        // BrandStoreActions.fetchStoreEmployeeRequest,
        // BrandStoreActions.fetchStoreEmployeesRequest,
        StoreActions.createStoreRequest,
        StoreActions.updateStoreRequest,
        StoreActions.deleteStoreRequest,
        StoreActions.updateStoreEmployeeRequest,
        StoreActions.deleteStoreEmployeeRequest,
        StoreActions.updateStatusStoreRequest,
        StoreActions.updateStatusStoreEmployeeRequest,
        StoreActions.fetchStoreEditRequest,
        StoreActions.fetchStoreRequest,
        StoreActions.fetchStoresRequest,
        StoreActions.fetchStoreEmployeeEditRequest,
        StoreActions.fetchStoreEmployeesRequest,
        StoreSettingActions.fetchStoreSettingsRequest,
        StoreSettingActions.createStoreSettingRequest,
        StoreSettingActions.updateStoreSettingRequest,
        state => ({
            ...state,
            isLoading: true
        })
    ),
    // on(
    //     // BrandStoreActions.updateStatusStoreRequest,
    //     // BrandStoreActions.updateStatusStoreEmployeeRequest,
    //     // BrandStoreActions.deleteStoreRequest,
    //     // BrandStoreActions.deleteStoreEmployeeRequest,
    //     StoreActions.deleteStoreRequest,
    //     StoreActions.deleteStoreEmployeeRequest,
    //     StoreActions.updateStatusStoreRequest,
    //     StoreActions.updateStatusStoreEmployeeRequest,
    //     state => ({
    //         ...state,
    //         isLoading: true,
    //         isRefresh: false
    //     })
    // ),
    on(
        // BrandStoreActions.createStoreFailure,
        // BrandStoreActions.updateStoreFailure,
        // BrandStoreActions.updateStoreEmployeeFailure,
        // BrandStoreActions.fetchBrandStoreFailure,
        // BrandStoreActions.fetchBrandStoreEditFailure,
        // BrandStoreActions.fetchBrandStoresFailure,
        // BrandStoreActions.fetchStoreEmployeeFailure,
        // BrandStoreActions.fetchStoreEmployeesFailure,
        StoreActions.createStoreFailure,
        StoreActions.updateStoreFailure,
        StoreActions.deleteStoreFailure,
        StoreActions.updateStoreEmployeeFailure,
        StoreActions.deleteStoreEmployeeFailure,
        StoreActions.updateStatusStoreFailure,
        StoreActions.updateStatusStoreEmployeeFailure,
        StoreActions.fetchStoreEditFailure,
        StoreActions.fetchStoreFailure,
        StoreActions.fetchStoresFailure,
        StoreActions.fetchStoreEmployeeEditFailure,
        StoreActions.fetchStoreEmployeesFailure,
        StoreSettingActions.fetchStoreSettingsFailure,
        StoreSettingActions.createStoreSettingFailure,
        StoreSettingActions.updateStoreSettingFailure,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            isRefresh: undefined,
            errors: adapterError.upsertOne(payload, state.errors)
        })
    ),
    // on(
    //     // BrandStoreActions.updateStatusStoreFailure,
    //     // BrandStoreActions.updateStatusStoreEmployeeFailure,
    //     // BrandStoreActions.deleteStoreFailure,
    //     // BrandStoreActions.deleteStoreEmployeeFailure,
    //     StoreActions.deleteStoreFailure,
    //     StoreActions.deleteStoreEmployeeFailure,
    //     StoreActions.updateStatusStoreRequest,
    //     StoreActions.updateStatusStoreEmployeeRequest,
    //     (state, { payload }) => ({
    //         ...state,
    //         isLoading: false,
    //         isRefresh: true,
    //         errors: adapterError.upsertOne(payload, state.errors)
    //     })
    // ),
    // on(BrandStoreActions.createStoreSuccess, (state, { payload }) => ({
    //     ...state,
    //     isLoading: false,
    //     errors: adapterError.removeOne('createStoreFailure', state.errors)
    // })),
    // on(BrandStoreActions.updateStoreSuccess, (state, { payload }) => ({
    //     ...state,
    //     isLoading: false,
    //     errors: adapterError.removeOne('updateStoreFailure', state.errors)
    // })),
    // on(BrandStoreActions.updateStatusStoreSuccess, (state, { payload }) => ({
    //     ...state,
    //     isLoading: false,
    //     isRefresh: true,
    //     errors: adapterError.removeOne('updateStatusStoreFailure', state.errors)
    // })),
    // on(BrandStoreActions.updateStatusStoreEmployeeSuccess, (state, { payload }) => ({
    //     ...state,
    //     isLoading: false,
    //     isRefresh: true,
    //     errors: adapterError.removeOne('updateStatusStoreEmployeeFailure', state.errors)
    // })),
    // on(BrandStoreActions.deleteStoreSuccess, (state, { payload }) => ({
    //     ...state,
    //     isLoading: false,
    //     isRefresh: true,
    //     brandStores: adapterBrandStore.removeOne(payload, {
    //         ...state.brandStores,
    //         total: state.brandStores.total - 1
    //     }),
    //     errors: adapterError.removeOne('deleteStoreFailure', state.errors)
    // })),
    // on(BrandStoreActions.updateStoreEmployeeSuccess, (state, { payload }) => ({
    //     ...state,
    //     isLoading: false,
    //     errors: adapterError.removeOne('updateStoreEmployeeFailure', state.errors)
    // })),
    // on(BrandStoreActions.deleteStoreEmployeeSuccess, (state, { payload }) => ({
    //     ...state,
    //     isLoading: false,
    //     isRefresh: true,
    //     employees: adapterStoreEmployee.removeOne(payload, {
    //         ...state.employees,
    //         total: state.employees.total - 1
    //     }),
    //     errors: adapterError.removeOne('deleteStoreEmployeeFailure', state.errors)
    // })),
    on(StoreSettingActions.resetSelectedStoreSettingId, (state) => ({
        ...state,
        settings: {
            ...state.settings,
            selectedId: null
        }
    })),
    on(StoreSettingActions.setSelectedStoreSettingId, (state, { payload }) => ({
        ...state,
        settings: {
            ...state.settings,
            selectedId: payload
        }
    })),
    on(StoreSettingActions.truncateStoreSetting, state => ({
        ...state,
        settings: adapterStoreSetting.removeAll(state.settings)
    })),
    on(StoreSettingActions.fetchStoreSettingsSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        settings: adapterStoreSetting.upsertMany(payload.data, {
            ...state.settings,
            total: payload.total
        })
    })),
    on(StoreSettingActions.updateStoreSettingSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        settings: adapterStoreSetting.upsertOne(payload, state.settings)
    })),
    on(StoreSettingActions.createStoreSettingSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        settings: adapterStoreSetting.upsertOne(payload, state.settings)
    })),
    on(StoreActions.fetchStoreEditSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        store: payload,
        errors: adapterError.removeOne('fetchStoreEditFailure', state.errors)
    })),
    on(StoreActions.fetchStoreSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isRefresh: undefined,
        // stores: adapterStore.updateOne(payload, { ...state.stores, selectedStoreId: payload.id }),
        stores: adapterStore.addOne(payload, { ...state.stores, selectedStoreId: payload.id }),
        errors: adapterError.removeOne('fetchStoreFailure', state.errors)
    })),
    on(StoreActions.fetchStoresSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isRefresh: undefined,
        stores: adapterStore.addAll(payload.data, { ...state.stores, total: payload.total }),
        errors: adapterError.removeOne('fetchStoresFailure', state.errors)
    })),
    on(StoreActions.fetchStoreEmployeeEditSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        employee: payload,
        errors: adapterError.removeOne('fetchStoreEmployeeEditFailure', state.errors)
    })),
    on(StoreActions.fetchStoreEmployeesSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isRefresh: undefined,
        employees: adapterStoreEmployee.addAll(payload.data, {
            ...state.employees,
            total: payload.total
        }),
        errors: adapterError.removeOne('fetchStoreEmployeesFailure', state.errors)
    })),
    on(StoreActions.createStoreSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        errors: adapterError.removeOne('createStoreFailure', state.errors)
    })),
    on(StoreActions.updateStoreSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        store: undefined,
        errors: adapterError.removeOne('updateStoreFailure', state.errors)
    })),
    on(StoreActions.deleteStoreSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        stores: adapterStore.removeOne(payload, {
            ...state.stores,
            total: state.stores.total - 1
        }),
        errors: adapterError.removeOne('deleteStoreFailure', state.errors)
    })),
    on(StoreActions.updateStoreEmployeeSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        employee: undefined,
        errors: adapterError.removeOne('updateStoreEmployeeFailure', state.errors)
    })),
    on(StoreActions.deleteStoreEmployeeSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        employees: adapterStoreEmployee.removeOne(payload, {
            ...state.employees,
            total: state.employees.total - 1
        }),
        errors: adapterError.removeOne('deleteStoreEmployeeFailure', state.errors)
    })),
    on(StoreActions.updateStatusStoreSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        stores: adapterStore.updateOne(payload, state.stores),
        errors: adapterError.removeOne('updateStatusStoreFailure', state.errors)
    })),
    on(StoreActions.updateStatusStoreEmployeeSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        employees: adapterStoreEmployee.updateOne(payload, state.employees),
        errors: adapterError.removeOne('updateStatusStoreEmployeeFailure', state.errors)
    })),
    on(StoreActions.setEditLocation, state => ({
        ...state,
        stores: {
            ...state.stores,
            isEditLocation: true
        }
    })),
    on(StoreActions.unsetEditLocation, state => ({
        ...state,
        stores: {
            ...state.stores,
            isEditLocation: false
        }
    })),
    on(StoreActions.resetStores, state => ({
        ...state,
        stores: initialState.stores,
        errors: adapterError.removeOne('fetchStoresFailure', state.errors)
    })),
    on(StoreActions.resetStore, state => ({
        ...state,
        stores: initialState.stores,
        // stores: { ...state.stores, selectedStoreId: null },
        errors: adapterError.removeOne('fetchStoreFailure', state.errors)
    })),
    on(StoreActions.resetStoreEmployees, state => ({
        ...state,
        employees: initialState.employees,
        errors: adapterError.removeOne('fetchStoreEmployeesFailure', state.errors)
    })),
    on(StoreActions.resetStoreEmployee, state => ({
        ...state,
        employees: initialState.employees,
        // employees: { ...state.employees, selectedEmployeeId: null },
        errors: adapterError.removeOne('fetchStoreEmployeeFailure', state.errors)
    })),
    on(StoreActions.resetGoPage, state => ({
        ...state,
        goPage: initialState.goPage
    })),
    on(StoreActions.goPage, (state, { payload }) => ({
        ...state,
        goPage: payload
    }))
    // on(BrandStoreActions.fetchBrandStoresSuccess, (state, { payload }) => ({
    //     ...state,
    //     isLoading: false,
    //     isRefresh: undefined,
    //     brandStores: adapterBrandStore.addAll(payload.brandStores, {
    //         ...state.brandStores,
    //         total: payload.total
    //     }),
    //     errors: adapterError.removeOne('fetchBrandStoresFailure', state.errors)
    // })),
    // on(BrandStoreActions.fetchBrandStoreSuccess, (state, { payload }) => ({
    //     ...state,
    //     isLoading: false,
    //     brandStore: payload.brandStore,
    //     errors: adapterError.removeOne('fetchBrandStoreFailure', state.errors)
    // })),
    // on(BrandStoreActions.fetchBrandStoreEditSuccess, (state, { payload }) => ({
    //     ...state,
    //     isLoading: false,
    //     editBrandStore: payload.brandStore,
    //     errors: adapterError.removeOne('fetchBrandStoreEditFailure', state.errors)
    // })),
    // on(BrandStoreActions.fetchStoreEmployeesSuccess, (state, { payload }) => ({
    //     ...state,
    //     isLoading: false,
    //     isRefresh: undefined,
    //     employees: adapterStoreEmployee.addAll(payload.employees, {
    //         ...state.employees,
    //         total: payload.total
    //     }),
    //     errors: adapterError.removeOne('fetchStoreEmployeesFailure', state.errors)
    // })),
    // on(BrandStoreActions.fetchStoreEmployeeSuccess, (state, { payload }) => ({
    //     ...state,
    //     isLoading: false,
    //     isRefresh: undefined,
    //     employee: payload.employee,
    //     errors: adapterError.removeOne('fetchStoreEmployeeFailure', state.errors)
    // })),
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

const getStoresState = (state: State) => state.stores;
const getStoreEmployeesState = (state: State) => state.employees;
const getStoreSettingState = (state: State) => state.settings;

export const {
    selectAll: selectAllStore,
    selectEntities: selectStoreEntities,
    selectIds: selectStoreIds,
    selectTotal: selectStoreTotal
} = adapterStore.getSelectors(getStoresState);

export const {
    selectAll: selectAllStoreEmployee,
    selectEntities: selectStoreEmployeeEntities,
    selectIds: selectStoreEmployeeIds,
    selectTotal: selectStoreEmployeeTotal
} = adapterStoreEmployee.getSelectors(getStoreEmployeesState);

export const {
    selectAll: selectAllStoreSetting,
    selectEntities: selectStoreSettingEntities,
    selectIds: selectStoreSettingIds,
    selectTotal: selectStoreSettingTotal
} = adapterStoreSetting.getSelectors(getStoreSettingState);

// const getListBrandStoreState = (state: State) => state.brandStores;
// const getListStoreEmployeeState = (state: State) => state.employees;

// export const {
//     selectAll: selectAllBrandStores,
//     selectEntities: selectBrandStoreEntities,
//     selectIds: selectBrandStoreIds,
//     selectTotal: selectBrandStoresTotal
// } = adapterBrandStore.getSelectors(getListBrandStoreState);

// export const {
//     selectAll: selectAllStoreEmployees,
//     selectEntities: selectStoreEmployeeEntities,
//     selectIds: selectStoreEmployeeIds,
//     selectTotal: selectStoreEmployeesTotal
// } = adapterStoreEmployee.getSelectors(getListStoreEmployeeState);
