import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import {
    Cluster,
    Hierarchy,
    IErrorHandler,
    Province,
    Role,
    StoreGroup,
    StoreSegment,
    StoreType,
    VehicleAccessibility
} from 'app/shared/models';

import { DropdownActions } from '../actions';

// import { Account } from 'app/main/pages/accounts/models';
// import { Role } from 'app/main/pages/roles/role.model';
export const FEATURE_KEY = 'dropdowns';

// interface AccountState extends EntityState<Account> {}
interface ErrorState extends EntityState<IErrorHandler> {
    selectedErrorId: string | number;
}

// interface SearchState {
//     accounts: AccountState;
// }

export interface State {
    // search: SearchState;
    hierarchies?: Hierarchy[];
    roles?: Role[];
    provinces?: Province[];
    storeClusters?: Cluster[];
    storeGroups?: StoreGroup[];
    storeSegments?: StoreSegment[];
    storeTypes?: StoreType[];
    vehicleAccessibilities?: VehicleAccessibility[];
    errors: ErrorState;
}
// const adapterAccount = createEntityAdapter<Account>();
// const initialAccountState = adapterAccount.getInitialState();

const adapterError = createEntityAdapter<IErrorHandler>({
    selectId: row => row.id
});
const initialErrorState = adapterError.getInitialState({ selectedErrorId: null });

export const initialState: State = {
    // search: {
    //     accounts: initialAccountState
    // },
    // roles: [],
    // provinces: [],
    errors: initialErrorState
};

const dropdownReducer = createReducer(
    initialState,
    // on(DropdownActions.fetchSearchAccountSuccess, (state, { payload }) => ({
    //     ...state,
    //     search: {
    //         ...state.search,
    //         accounts: adapterAccount.addAll(payload, state.search.accounts)
    //     },
    //     errors: adapterError.removeOne('fetchAccountSearchFailure', state.errors)
    // })),
    on(
        DropdownActions.fetchDropdownHierarchyFailure,
        DropdownActions.fetchDropdownProvinceFailure,
        DropdownActions.fetchDropdownRoleFailure,
        DropdownActions.fetchDropdownStoreClusterFailure,
        DropdownActions.fetchDropdownStoreGroupFailure,
        DropdownActions.fetchDropdownStoreSegmentFailure,
        DropdownActions.fetchDropdownStoreTypeFailure,
        DropdownActions.fetchDropdownVehicleAccessibilityFailure,
        DropdownActions.fetchSearchAccountFailure,
        (state, { payload }) => ({
            ...state,
            errors: adapterError.upsertOne(payload, state.errors)
        })
    ),
    on(DropdownActions.fetchDropdownHierarchySuccess, (state, { payload }) => ({
        ...state,
        hierarchies: payload,
        errors: adapterError.removeOne('fetchDropdownHierarchyFailure', state.errors)
    })),
    on(DropdownActions.fetchDropdownProvinceSuccess, (state, { payload }) => ({
        ...state,
        provinces: payload,
        errors: adapterError.removeOne('fetchDropdownProvinceFailure', state.errors)
    })),
    on(DropdownActions.fetchDropdownRoleSuccess, (state, { payload }) => ({
        ...state,
        roles: payload,
        errors: adapterError.removeOne('fetchDropdownRoleFailure', state.errors)
    })),
    on(DropdownActions.fetchDropdownStoreClusterSuccess, (state, { payload }) => ({
        ...state,
        storeClusters: payload,
        errors: adapterError.removeOne('fetchDropdownStoreClusterFailure', state.errors)
    })),
    on(DropdownActions.fetchDropdownStoreGroupSuccess, (state, { payload }) => ({
        ...state,
        storeGroups: payload,
        errors: adapterError.removeOne('fetchDropdownStoreGroupFailure', state.errors)
    })),
    on(DropdownActions.fetchDropdownStoreSegmentSuccess, (state, { payload }) => ({
        ...state,
        storeSegments: payload,
        errors: adapterError.removeOne('fetchDropdownStoreSegmentFailure', state.errors)
    })),
    on(DropdownActions.fetchDropdownStoreTypeSuccess, (state, { payload }) => ({
        ...state,
        storeTypes: payload,
        errors: adapterError.removeOne('fetchDropdownStoreTypeFailure', state.errors)
    })),
    on(DropdownActions.fetchDropdownVehicleAccessibilitySuccess, (state, { payload }) => ({
        ...state,
        vehicleAccessibilities: payload,
        errors: adapterError.removeOne('fetchDropdownVehicleAccessibilityFailure', state.errors)
    }))
);

export function reducer(state: State | undefined, action: Action): State {
    return dropdownReducer(state, action);
}

const selectProvinceState = (state: State) => state.provinces;
const getErrorsState = (state: State) => state.errors;
// const getListSearchAccountState = (state: State) => state.search.accounts;

// export const {
//     selectAll: selectAllSearchAccounts,
//     selectEntities: selectSearchAccountEntities,
//     selectIds: selectSearchAccountIds,
//     selectTotal: selectSearchAccountsTotal
// } = adapterAccount.getSelectors(getListSearchAccountState);

export const {
    selectAll: selectAllError,
    selectEntities: selectErrorEntities,
    selectIds: selectErrorIds,
    selectTotal: selectErrorTotal
} = adapterError.getSelectors(getErrorsState);
