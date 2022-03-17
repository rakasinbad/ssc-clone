import { createAction, props } from '@ngrx/store';
// import { CreditLimitGroup } from 'app/main/pages/finances/credit-limit-balance/models';
import { Cluster } from 'app/shared/models/cluster.model';
import { Hierarchy } from 'app/shared/models/customer-hierarchy.model';
import { GeoParameter, IErrorHandler } from 'app/shared/models/global.model';
import { InvoiceGroup } from 'app/shared/models/invoice-group.model';
import { District, Province, Urban } from 'app/shared/models/location.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { Role } from 'app/shared/models/role.model';
import { StoreGroup } from 'app/shared/models/store-group.model';
import { StoreSegment } from 'app/shared/models/store-segment.model';
import { StoreType } from 'app/shared/models/store-type.model';
import { VehicleAccessibility } from 'app/shared/models/vehicle-accessibility.model';

// import { Account } from 'app/main/pages/accounts/models';
// import { Role } from 'app/main/pages/roles/role.model';

// -----------------------------------------------------------------------------------------------------
// Fetch Location Base Google Data [Location]
// -----------------------------------------------------------------------------------------------------

export const fetchLocationRequest = createAction(
    '[Helper Location] Fetch Location Request',
    props<{ payload: { province: string; city: string; district: string; urban: string } }>()
);

export const fetchLocationFailure = createAction(
    '[Helper Location] Fetch Location Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchLocationSuccess = createAction(
    '[Helper Location] Fetch Location Success',
    props<{ payload: Urban }>()
);

export const resetLocation = createAction('[Helper Location] Reset Location State');

// -----------------------------------------------------------------------------------------------------
// Fetch Autocomplete [Districts]
// -----------------------------------------------------------------------------------------------------

export const searchDistrictRequest = createAction(
    '[Helper Dropdown] Search District Request',
    props<{ payload: IQueryParams }>()
);

export const fetchDistrictRequest = createAction(
    '[Helper Dropdown] Fetch District Request',
    props<{ payload: IQueryParams }>()
);

export const fetchDistrictFailure = createAction(
    '[Helper Dropdown] Fetch District Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchDistrictSuccess = createAction(
    '[Helper Dropdown] Fetch District Success',
    props<{ payload: { data: District[]; total: number } }>()
);

export const fetchScrollDistrictRequest = createAction(
    '[Helper Dropdown] Fetch Scroll District Request',
    props<{ payload: IQueryParams }>()
);

export const fetchScrollDistrictFailure = createAction(
    '[Helper Dropdown] Fetch Scroll District Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchScrollDistrictSuccess = createAction(
    '[Helper Dropdown] Fetch Scroll District Success',
    props<{ payload: { data: District[]; total: number } }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Autocomplete [Urbans]
// -----------------------------------------------------------------------------------------------------

export const searchUrbanRequest = createAction(
    '[Helper Dropdown] Search Urban Request',
    props<{ payload: string }>()
);

export const setUrbanSource = createAction(
    '[Helper Dropdown] Set Urban Source',
    props<{ payload: Urban[] }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Credit Limit Group
// -----------------------------------------------------------------------------------------------------

export const fetchDropdownCreditLimitGroupRequest = createAction(
    '[Helper Dropdown] Fetch Credit Limit Group Request'
);

export const fetchDropdownCreditLimitGroupFailure = createAction(
    '[Helper Dropdown] Fetch Credit Limit Group Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchDropdownCreditLimitGroupSuccess = createAction(
    '[Helper Dropdown] Fetch Credit Limit Group Success',
    props<{ payload: any }>()
);

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
// Fetch Invoice Group
// -----------------------------------------------------------------------------------------------------

export const fetchDropdownInvoiceGroupRequest = createAction(
    '[Helper Dropdown] Fetch Invoice Group Request'
);

export const fetchDropdownInvoiceGroupFailure = createAction(
    '[Helper Dropdown] Fetch Invoice Group Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchDropdownInvoiceGroupSuccess = createAction(
    '[Helper Dropdown] Fetch Invoice Group Success',
    props<{ payload: InvoiceGroup[] }>()
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
    props<{ payload: any }>()
);

// -----------------------------------------------------------------------------------------------------
// Helper Actions
// -----------------------------------------------------------------------------------------------------

export const resetInvoiceGroupState = createAction('[Helper Dropdown] Reset Invoice Group State');

export const resetProvinceState = createAction('[Helper Dropdown] Reset Province State');

export const resetGeoparamsState = createAction('[Helper Dropdown] Reset Geoparams State');

export const resetDistrictsState = createAction('[Helper Dropdown] Reset Districts State');

export const resetUrbansState = createAction('[Helper Dropdown] Reset Urbans State');
