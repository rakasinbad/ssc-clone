import { createAction, props } from '@ngrx/store';
import {
    Cluster,
    GeoParameter,
    Hierarchy,
    IErrorHandler,
    IQueryParams,
    Province,
    Role,
    StoreGroup,
    StoreSegment,
    StoreType,
    VehicleAccessibility
} from 'app/shared/models';

// import { Account } from 'app/main/pages/accounts/models';
// import { Role } from 'app/main/pages/roles/role.model';

// -----------------------------------------------------------------------------------------------------
// Fetch Geo Parameter
// -----------------------------------------------------------------------------------------------------

export const fetchDropdownGeoParameterRequest = createAction(
    '[Helper Dropdown] Fetch Geo Parameter Request',
    props<{ payload: Partial<GeoParameter> }>()
);

export const fetchDropdownGeoParameterFailure = createAction(
    '[Helper Dropdown] Fetch Geo Parameter Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchDropdownGeoParameterSuccess = createAction(
    '[Helper Dropdown] Fetch Geo Parameter Success',
    props<{ payload: GeoParameter[] }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Geo Parameter [Province]
// -----------------------------------------------------------------------------------------------------

export const fetchDropdownGeoParameterProvinceRequest = createAction(
    '[Helper Dropdown] Fetch Geo Parameter Province Request',
    props<{ payload: Partial<GeoParameter> }>()
);

export const fetchDropdownGeoParameterProvinceFailure = createAction(
    '[Helper Dropdown] Fetch Geo Parameter Province Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchDropdownGeoParameterProvinceSuccess = createAction(
    '[Helper Dropdown] Fetch Geo Parameter Province Success',
    props<{ payload: GeoParameter }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Geo Parameter [City]
// -----------------------------------------------------------------------------------------------------

export const fetchDropdownGeoParameterCityRequest = createAction(
    '[Helper Dropdown] Fetch Geo Parameter City Request',
    props<{ payload: Partial<GeoParameter> }>()
);

export const fetchDropdownGeoParameterCityFailure = createAction(
    '[Helper Dropdown] Fetch Geo Parameter City Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchDropdownGeoParameterCitySuccess = createAction(
    '[Helper Dropdown] Fetch Geo Parameter City Success',
    props<{ payload: GeoParameter }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Geo Parameter [District]
// -----------------------------------------------------------------------------------------------------

export const fetchDropdownGeoParameterDistrictRequest = createAction(
    '[Helper Dropdown] Fetch Geo Parameter District Request',
    props<{ payload: Partial<GeoParameter> }>()
);

export const fetchDropdownGeoParameterDistrictFailure = createAction(
    '[Helper Dropdown] Fetch Geo Parameter District Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchDropdownGeoParameterDistrictSuccess = createAction(
    '[Helper Dropdown] Fetch Geo Parameter District Success',
    props<{ payload: GeoParameter }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Geo Parameter [Urban]
// -----------------------------------------------------------------------------------------------------

export const fetchDropdownGeoParameterUrbanRequest = createAction(
    '[Helper Dropdown] Fetch Geo Parameter Urban Request',
    props<{ payload: Partial<GeoParameter> }>()
);

export const fetchDropdownGeoParameterUrbanFailure = createAction(
    '[Helper Dropdown] Fetch Geo Parameter Urban Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchDropdownGeoParameterUrbanSuccess = createAction(
    '[Helper Dropdown] Fetch Geo Parameter Urban Success',
    props<{ payload: GeoParameter }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Hierarchy
// -----------------------------------------------------------------------------------------------------

export const fetchDropdownHierarchyRequest = createAction(
    '[Helper Dropdown] Fetch Hierarchy Request'
);

export const fetchDropdownHierarchyFailure = createAction(
    '[Helper Dropdown] Fetch Hierarchy Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchDropdownHierarchySuccess = createAction(
    '[Helper Dropdown] Fetch Hierarchy Success',
    props<{ payload: Hierarchy[] }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Role
// -----------------------------------------------------------------------------------------------------

export const fetchDropdownRoleRequest = createAction('[Helper Dropdown] Fetch Role Request');

export const fetchDropdownRoleByTypeRequest = createAction(
    '[Helper Dropdown] Fetch Role By Type Request',
    props<{ payload: string }>()
);

export const fetchDropdownRoleFailure = createAction(
    '[Helper Dropdown] Fetch Role Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchDropdownRoleSuccess = createAction(
    '[Helper Dropdown] Fetch Role Success',
    props<{ payload: Role[] }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Province
// -----------------------------------------------------------------------------------------------------

export const fetchDropdownProvinceRequest = createAction(
    '[Helper Dropdown] Fetch Province Request'
);

export const fetchDropdownProvinceFailure = createAction(
    '[Helper Dropdown] Fetch Province Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchDropdownProvinceSuccess = createAction(
    '[Helper Dropdown] Fetch Province Success',
    props<{ payload: Province[] }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Store Cluster
// -----------------------------------------------------------------------------------------------------

export const fetchDropdownStoreClusterRequest = createAction(
    '[Helper Dropdown] Fetch Store Cluster Request'
);

export const fetchDropdownStoreClusterFailure = createAction(
    '[Helper Dropdown] Fetch Store Cluster Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchDropdownStoreClusterSuccess = createAction(
    '[Helper Dropdown] Fetch Store Cluster Success',
    props<{ payload: Cluster[] }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Store Group
// -----------------------------------------------------------------------------------------------------

export const fetchDropdownStoreGroupRequest = createAction(
    '[Helper Dropdown] Fetch Store Group Request'
);

export const fetchDropdownStoreGroupFailure = createAction(
    '[Helper Dropdown] Fetch Store Group Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchDropdownStoreGroupSuccess = createAction(
    '[Helper Dropdown] Fetch Store Group Success',
    props<{ payload: StoreGroup[] }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Store Segment
// -----------------------------------------------------------------------------------------------------

export const fetchDropdownStoreSegmentRequest = createAction(
    '[Helper Dropdown] Fetch Store Segment Request'
);

export const fetchDropdownStoreSegmentFailure = createAction(
    '[Helper Dropdown] Fetch Store Segment Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchDropdownStoreSegmentSuccess = createAction(
    '[Helper Dropdown] Fetch Store Segment Success',
    props<{ payload: StoreSegment[] }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Store Type
// -----------------------------------------------------------------------------------------------------

export const fetchDropdownStoreTypeRequest = createAction(
    '[Helper Dropdown] Fetch Store Type Request'
);

export const fetchDropdownStoreTypeFailure = createAction(
    '[Helper Dropdown] Fetch Store Type Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchDropdownStoreTypeSuccess = createAction(
    '[Helper Dropdown] Fetch Store Type Success',
    props<{ payload: StoreType[] }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Vehicle Accessibility
// -----------------------------------------------------------------------------------------------------

export const fetchDropdownVehicleAccessibilityRequest = createAction(
    '[Helper Dropdown] Fetch Vehicle Accessibility Request'
);

export const fetchDropdownVehicleAccessibilityFailure = createAction(
    '[Helper Dropdown] Fetch Vehicle Accessibility Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchDropdownVehicleAccessibilitySuccess = createAction(
    '[Helper Dropdown] Fetch Vehicle Accessibility Success',
    props<{ payload: VehicleAccessibility[] }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Search Account
// -----------------------------------------------------------------------------------------------------

export const fetchSearchAccountRequest = createAction(
    '[Helper Search] Fetch Account Request',
    props<{ payload: IQueryParams }>()
);

export const fetchSearchAccountFailure = createAction(
    '[Helper Search] Fetch Account Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchSearchAccountSuccess = createAction(
    '[Helper Search] Fetch Account Success',
    props<{ payload: Account[] }>()
);
