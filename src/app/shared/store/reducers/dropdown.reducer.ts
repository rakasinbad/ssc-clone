import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { Account } from 'app/main/pages/accounts/models';
import { Role } from 'app/main/pages/roles/role.model';
import {
    IErrorHandler,
    Province,
    StoreCluster,
    StoreGroup,
    StoreSegment,
    StoreType,
    VehicleAccessibility
} from 'app/shared/models';

import { DropdownActions } from '../actions';

export const FEATURE_KEY = 'dropdowns';

interface AccountState extends EntityState<Account> {}
interface ErrorState extends EntityState<IErrorHandler> {}

interface SearchState {
    accounts: AccountState;
}

export interface State {
    search: SearchState;
    roles: Role[];
    provinces?: Province[];
    storeClusters?: StoreCluster[];
    storeGroups?: StoreGroup[];
    storeSegments?: StoreSegment[];
    storeTypes?: StoreType[];
    vehicleAccessibilities?: VehicleAccessibility[];
    errors: ErrorState;
}
const adapterAccount = createEntityAdapter<Account>();
const initialAccountState = adapterAccount.getInitialState();

const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

export const initialState: State = {
    search: {
        accounts: initialAccountState
    },
    roles: [],
    // provinces: [],
    errors: initialErrorState
};

const dropdownReducer = createReducer(
    initialState,
    on(DropdownActions.fetchDropdownRoleSuccess, (state, { payload }) => ({
        ...state,
        roles: [...payload]
    })),
    on(DropdownActions.fetchDropdownProvinceSuccess, (state, { payload }) => ({
        ...state,
        provinces: payload && payload.length > 0 ? [...payload] : payload
    })),
    on(DropdownActions.fetchSearchAccountSuccess, (state, { payload }) => ({
        ...state,
        search: {
            ...state.search,
            accounts: adapterAccount.addAll(payload, state.search.accounts)
        },
        errors: adapterError.removeOne('fetchAccountSearchFailure', state.errors)
    })),
    on(
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
    on(DropdownActions.fetchDropdownStoreClusterSuccess, (state, { payload }) => ({
        ...state,
        storeClusters: payload && payload.length > 0 ? [...payload] : payload,
        errors: adapterError.removeOne('fetchDropdownStoreClusterFailure', state.errors)
    })),
    on(DropdownActions.fetchDropdownStoreGroupSuccess, (state, { payload }) => ({
        ...state,
        storeGroups: payload && payload.length > 0 ? [...payload] : payload,
        errors: adapterError.removeOne('fetchDropdownStoreGroupFailure', state.errors)
    })),
    on(DropdownActions.fetchDropdownStoreSegmentSuccess, (state, { payload }) => ({
        ...state,
        storeSegments: payload && payload.length > 0 ? [...payload] : payload,
        errors: adapterError.removeOne('fetchDropdownStoreSegmentFailure', state.errors)
    })),
    on(DropdownActions.fetchDropdownStoreTypeSuccess, (state, { payload }) => ({
        ...state,
        storeTypes: payload && payload.length > 0 ? [...payload] : payload,
        errors: adapterError.removeOne('fetchDropdownStoreTypeFailure', state.errors)
    })),
    on(DropdownActions.fetchDropdownVehicleAccessibilitySuccess, (state, { payload }) => ({
        ...state,
        vehicleAccessibilities: payload && payload.length > 0 ? [...payload] : payload,
        errors: adapterError.removeOne('fetchDropdownVehicleAccessibilityFailure', state.errors)
    }))
);

export function reducer(state: State | undefined, action: Action): State {
    return dropdownReducer(state, action);
}

export const selectProvincesState = (state: State) => state.provinces;

const getListSearchAccountState = (state: State) => state.search.accounts;

export const {
    selectAll: selectAllSearchAccounts,
    selectEntities: selectSearchAccountEntities,
    selectIds: selectSearchAccountIds,
    selectTotal: selectSearchAccountsTotal
} = adapterAccount.getSelectors(getListSearchAccountState);
