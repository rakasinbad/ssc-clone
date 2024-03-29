import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { CreditLimitGroup } from 'app/main/pages/finances/credit-limit-balance/models';
import { Cluster } from 'app/shared/models/cluster.model';
import { Hierarchy } from 'app/shared/models/customer-hierarchy.model';
import { GeoParameter, IErrorHandler } from 'app/shared/models/global.model';
import { InvoiceGroup } from 'app/shared/models/invoice-group.model';
import { District, Province, Urban } from 'app/shared/models/location.model';
import { Role } from 'app/shared/models/role.model';
import { StoreGroup } from 'app/shared/models/store-group.model';
import { StoreSegment } from 'app/shared/models/store-segment.model';
import { StoreType } from 'app/shared/models/store-type.model';
import { VehicleAccessibility } from 'app/shared/models/vehicle-accessibility.model';

import { DropdownActions } from '../actions';

// import { Account } from 'app/main/pages/accounts/models';
// import { Role } from 'app/main/pages/roles/role.model';
export const FEATURE_KEY = 'dropdowns';

interface DistrictState extends EntityState<District> {
    isLoading: boolean;
    selectedId: string | number;
    total: number;
}

interface GeoParameterState extends EntityState<GeoParameter> {
    selectedId: string | number;
}

interface UrbanState extends EntityState<Urban> {
    isLoading: boolean;
    selectedId: string | number;
}

// interface AccountState extends EntityState<Account> {}
interface ErrorState extends EntityState<IErrorHandler> {
    selectedErrorId: string | number;
}

// interface SearchState {
//     accounts: AccountState;
// }

export interface State {
    // search: SearchState;
    creditLimitGroups?: CreditLimitGroup[];
    districts: DistrictState;
    urbans: UrbanState;
    hierarchies?: Hierarchy[];
    invoiceGroups?: InvoiceGroup[];
    roles?: Role[];
    provinces?: Province[];
    storeClusters?: Cluster[];
    storeGroups?: StoreGroup[];
    storeSegments?: StoreSegment[];
    storeTypes?: StoreType[];
    geoParameters: GeoParameterState;
    vehicleAccessibilities?: VehicleAccessibility[];
    location: Urban;
    errors: ErrorState;
}
// const adapterAccount = createEntityAdapter<Account>();
// const initialAccountState = adapterAccount.getInitialState();

const adapterDistrict = createEntityAdapter<District>({ selectId: row => row.id });
const initialDistrictState = adapterDistrict.getInitialState({
    selectedId: null,
    total: 0,
    isLoading: false
});

const adapterUrban = createEntityAdapter<Urban>({ selectId: row => row.id });
const initialUrbanState = adapterUrban.getInitialState({ selectedId: null, isLoading: false });

const adapterGeoParameter = createEntityAdapter<GeoParameter>({ selectId: row => row.id });
const initialGeoParameterState = adapterGeoParameter.getInitialState({ selectedId: null });

const adapterError = createEntityAdapter<IErrorHandler>({
    selectId: row => row.id
});
const initialErrorState = adapterError.getInitialState({ selectedErrorId: null });

export const initialState: State = {
    districts: initialDistrictState,
    geoParameters: initialGeoParameterState,
    urbans: initialUrbanState,
    location: undefined,
    errors: initialErrorState
};

/*     // on(DropdownActions.fetchSearchAccountSuccess, (state, { payload }) => ({
    //     ...state,
    //     search: {
    //         ...state.search,
    //         accounts: adapterAccount.addAll(payload, state.search.accounts)
    //     },
    //     errors: adapterError.removeOne('fetchAccountSearchFailure', state.errors)
    // })), */

const dropdownReducer = createReducer<State>(
    initialState,
    on(DropdownActions.fetchDistrictRequest, DropdownActions.fetchScrollDistrictRequest, state => ({
        ...state,
        districts: {
            ...state.districts,
            isLoading: true
        }
    })),
    on(
        DropdownActions.fetchDropdownCreditLimitGroupFailure,
        DropdownActions.fetchDropdownGeoParameterProvinceFailure,
        DropdownActions.fetchDropdownGeoParameterCityFailure,
        DropdownActions.fetchDropdownGeoParameterDistrictFailure,
        DropdownActions.fetchDropdownGeoParameterUrbanFailure,
        DropdownActions.fetchDropdownHierarchyFailure,
        DropdownActions.fetchDropdownInvoiceGroupFailure,
        DropdownActions.fetchDropdownInvoiceGroupWhSupFailure,
        DropdownActions.fetchDropdownProvinceFailure,
        DropdownActions.fetchDropdownRoleFailure,
        DropdownActions.fetchDropdownStoreClusterFailure,
        DropdownActions.fetchDropdownStoreGroupFailure,
        DropdownActions.fetchDropdownStoreSegmentFailure,
        DropdownActions.fetchDropdownStoreTypeFailure,
        DropdownActions.fetchDropdownVehicleAccessibilityFailure,
        DropdownActions.fetchLocationFailure,
        DropdownActions.fetchSearchAccountFailure,
        (state, { payload }) => ({
            ...state,
            errors: adapterError.upsertOne(payload, state.errors)
        })
    ),
    on(DropdownActions.fetchLocationSuccess, (state, { payload }) => ({
        ...state,
        location: payload
    })),
    on(DropdownActions.fetchDropdownCreditLimitGroupSuccess, (state, { payload }) => ({
        ...state,
        creditLimitGroups: payload,
        errors: adapterError.removeOne('fetchDropdownCreditLimitGroupFailure', state.errors)
    })),
    on(DropdownActions.fetchDropdownGeoParameterProvinceSuccess, (state, { payload }) => ({
        ...state,
        geoParameters: adapterGeoParameter.upsertOne(payload, state.geoParameters),
        errors: adapterError.removeOne('fetchDropdownGeoParameterProvinceFailure', state.errors)
    })),
    on(DropdownActions.fetchDropdownGeoParameterCitySuccess, (state, { payload }) => ({
        ...state,
        geoParameters: adapterGeoParameter.upsertOne(payload, state.geoParameters),
        errors: adapterError.removeOne('fetchDropdownGeoParameterCityFailure', state.errors)
    })),
    on(DropdownActions.fetchDropdownGeoParameterDistrictSuccess, (state, { payload }) => ({
        ...state,
        geoParameters: adapterGeoParameter.upsertOne(payload, state.geoParameters),
        errors: adapterError.removeOne('fetchDropdownGeoParameterDistrictFailure', state.errors)
    })),
    on(DropdownActions.fetchDropdownGeoParameterUrbanSuccess, (state, { payload }) => ({
        ...state,
        geoParameters: adapterGeoParameter.upsertOne(payload, state.geoParameters),
        errors: adapterError.removeOne('fetchDropdownGeoParameterUrbanFailure', state.errors)
    })),
    on(DropdownActions.fetchDropdownHierarchySuccess, (state, { payload }) => ({
        ...state,
        hierarchies: payload,
        errors: adapterError.removeOne('fetchDropdownHierarchyFailure', state.errors)
    })),
    on(DropdownActions.fetchDropdownInvoiceGroupSuccess, (state, { payload }) => ({
        ...state,
        invoiceGroups: payload,
        errors: adapterError.removeOne('fetchDropdownInvoiceGroupFailure', state.errors)
    })),
    on(DropdownActions.fetchDropdownInvoiceGroupWhSupSuccess, (state, { payload }) => ({
        ...state,
        invoiceGroups: payload,
        errors: adapterError.removeOne('fetchDropdownInvoiceGroupWhSupFailure', state.errors)
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
    })),
    on(DropdownActions.fetchDistrictSuccess, (state, { payload }) => ({
        ...state,
        districts: adapterDistrict.addAll(payload.data, {
            ...state.districts,
            selectedId: null,
            total: payload.total,
            isLoading: false
        }),
        errors: adapterError.removeOne('fetchDistrictFailure', state.errors)
    })),
    on(DropdownActions.fetchScrollDistrictSuccess, (state, { payload }) => ({
        ...state,
        districts: adapterDistrict.upsertMany(payload.data, {
            ...state.districts,
            selectedId: null,
            total: payload.total,
            isLoading: false
        }),
        errors: adapterError.removeOne('fetchScrollDistrictFailure', state.errors)
    })),
    on(DropdownActions.setUrbanSource, (state, { payload }) => ({
        ...state,
        urbans: adapterUrban.addAll(payload, state.urbans)
    })),
    on(DropdownActions.resetDistrictsState, state => ({
        ...state,
        districts: initialState.districts
    })),
    on(DropdownActions.resetInvoiceGroupState, state => ({
        ...state,
        invoiceGroups: undefined
    })),
    on(DropdownActions.resetProvinceState, state => ({
        ...state,
        provinces: undefined
    })),
    on(DropdownActions.resetGeoparamsState, state => ({
        ...state,
        geoParameters: initialState.geoParameters
    })),
    on(DropdownActions.resetUrbansState, state => ({
        ...state,
        urbans: initialState.urbans
    }))
);

export function reducer(state: State | undefined, action: Action): State {
    return dropdownReducer(state, action);
}

const selectProvinceState = (state: State) => state.provinces;
const getDistrictsState = (state: State) => state.districts;
const getGeoParametersState = (state: State) => state.geoParameters;
const getUrbansState = (state: State) => state.urbans;
const getErrorsState = (state: State) => state.errors;
// const getListSearchAccountState = (state: State) => state.search.accounts;

// export const {
//     selectAll: selectAllSearchAccounts,
//     selectEntities: selectSearchAccountEntities,
//     selectIds: selectSearchAccountIds,
//     selectTotal: selectSearchAccountsTotal
// } = adapterAccount.getSelectors(getListSearchAccountState);

export const {
    selectAll: selectAllDistrict,
    selectEntities: selectDistrictEntities,
    selectIds: selectDistrictIds,
    selectTotal: selectDistrictTotal
} = adapterDistrict.getSelectors(getDistrictsState);

export const {
    selectAll: selectAllGeoParameter,
    selectEntities: selectGeoParameterEntities,
    selectIds: selectGeoParameterIds,
    selectTotal: selectGeoParameterTotal
} = adapterGeoParameter.getSelectors(getGeoParametersState);

export const {
    selectAll: selectAllUrban,
    selectEntities: selecteUrbanEntities,
    selectIds: selectUrbanIds,
    selectTotal: selectUrbanTotal
} = adapterUrban.getSelectors(getUrbansState);

export const {
    selectAll: selectAllError,
    selectEntities: selectErrorEntities,
    selectIds: selectErrorIds,
    selectTotal: selectErrorTotal
} = adapterError.getSelectors(getErrorsState);
