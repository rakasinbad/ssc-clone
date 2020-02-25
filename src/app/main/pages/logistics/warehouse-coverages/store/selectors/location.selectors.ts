import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromLocation from '../reducers/location.reducer';
import * as fromWarehouseCoverages from '../reducers/warehouse-coverage.reducer';
import * as fromWarehouseCoveragesCore from '../reducers';

const getWarehouseCoveragesCoreState = createFeatureSelector<
    fromWarehouseCoveragesCore.FeatureState,
    fromWarehouseCoveragesCore.State
>(fromWarehouseCoveragesCore.featureKey);

export const getWarehouseEntitiesState = createSelector(
    getWarehouseCoveragesCoreState,
    state => state.warehouseCoverages
);

export const {
    selectAll: selectAllWarehouseCoverages,
    selectEntities: selectWarehouseCoveragesEntities,
    selectIds: selectWarehouseCoveragesIds,
    selectTotal: selectWarehouseCoveragesTotal
} = fromWarehouseCoverages.adapter.getSelectors(getWarehouseEntitiesState);

export const getLocationState = createSelector(
    getWarehouseCoveragesCoreState,
    state => state.locations
);

// Province
export const getProvinceEntitiesState = createSelector(
    getLocationState,
    state => state.province
);

export const {
    selectAll: selectAllProvices,
    selectEntities: selectProviceEntities,
    selectIds: selectProvinceIds,
    selectTotal: selectProvinceTotal
} = fromLocation.adapterProvince.getSelectors(getProvinceEntitiesState);

export const getProvinceLoadingState = createSelector(
    getProvinceEntitiesState,
    state => state.isLoading
);

export const getProvinceRefreshState = createSelector(
    getProvinceEntitiesState,
    state => state.needRefresh
);

export const getSelectedProvince = createSelector(
    getProvinceEntitiesState,
    state => state.selected
);

export const getProvinceTotal = createSelector(
    getProvinceEntitiesState,
    state => state.total
);

// City
export const getCityEntitiesState = createSelector(
    getLocationState,
    state => state.city
);

export const {
    selectAll: selectAllCities,
    selectEntities: selectCityEntities,
    selectIds: selectCityIds,
    selectTotal: selectCityTotal
} = fromLocation.adapterCity.getSelectors(getCityEntitiesState);

export const getCityLoadingState = createSelector(
    getCityEntitiesState,
    state => state.isLoading
);

export const getCityRefreshState = createSelector(
    getCityEntitiesState,
    state => state.needRefresh
);

export const getSelectedCity = createSelector(
    getCityEntitiesState,
    state => state.selected
);

export const getCityTotal = createSelector(
    getCityEntitiesState,
    state => state.total
);

// District
export const getDistrictEntitiesState = createSelector(
    getLocationState,
    state => state.district
);

export const {
    selectAll: selectAllDistricts,
    selectEntities: selectDistrictEntities,
    selectIds: selectDistrictIds,
    selectTotal: selectDistrictTotal
} = fromLocation.adapterDistrict.getSelectors(getDistrictEntitiesState);

export const getDistrictLoadingState = createSelector(
    getDistrictEntitiesState,
    state => state.isLoading
);

export const getDistrictRefreshState = createSelector(
    getDistrictEntitiesState,
    state => state.needRefresh
);

export const getSelectedDistrict = createSelector(
    getDistrictEntitiesState,
    state => state.selected
);

export const getDistrictTotal = createSelector(
    getDistrictEntitiesState,
    state => state.total
);
// 
// Urban
export const getUrbanEntitiesState = createSelector(
    getLocationState,
    state => state.urban
);

export const {
    selectAll: selectAllUrbans,
    selectEntities: selectUrbanEntities,
    selectIds: selectUrbanIds,
    selectTotal: selectUrbanTotal
} = fromLocation.adapterUrban.getSelectors(getUrbanEntitiesState);

export const getUrbanLoadingState = createSelector(
    getUrbanEntitiesState,
    state => state.isLoading
);

export const getUrbanRefreshState = createSelector(
    getUrbanEntitiesState,
    state => state.needRefresh
);

export const getSelectedUrban = createSelector(
    getUrbanEntitiesState,
    state => state.selected
);

export const getUrbanTotal = createSelector(
    getUrbanEntitiesState,
    state => state.total
);
