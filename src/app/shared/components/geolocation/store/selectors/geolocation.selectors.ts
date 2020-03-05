import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromGeolocationCore from '../reducers';

const getGeolocationCoreState = createFeatureSelector<fromGeolocationCore.FeatureState, fromGeolocationCore.State>(fromGeolocationCore.featureKey);

// Province
export const getProvinceEntitiesState = createSelector(
    getGeolocationCoreState,
    state => state.provinces
);

export const {
    selectAll: selectAllProvinces,
    selectEntities: selectProvincesEntities,
    selectIds: selectProvincesIds,
    selectTotal: selectProvincesTotal
} = fromGeolocationCore.fromProvince.adapterProvince.getSelectors(getProvinceEntitiesState);

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

export const getSelectedProvinceEntity = createSelector(
    getProvinceEntitiesState,
    getSelectedProvince,
    (state, provinceId) => state.entities[provinceId]
);

export const getProvinceTotal = createSelector(
    getProvinceEntitiesState,
    state => state.total
);

// City
export const getCityEntitiesState = createSelector(
    getGeolocationCoreState,
    state => state.cities
);

export const {
    selectAll: selectAllCities,
    selectEntities: selectCitiesEntities,
    selectIds: selectCitiesIds,
    selectTotal: selectCitiesTotal
} = fromGeolocationCore.fromCity.adapterCity.getSelectors(getCityEntitiesState);

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
    getGeolocationCoreState,
    state => state.districts
);

export const {
    selectAll: selectAllDistricts,
    selectEntities: selectDistrictsEntities,
    selectIds: selectDistrictsIds,
    selectTotal: selectDistrictsTotal
} = fromGeolocationCore.fromDistrict.adapterDistrict.getSelectors(getDistrictEntitiesState);

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

// Urban
export const getUrbanEntitiesState = createSelector(
    getGeolocationCoreState,
    state => state.urbans
);

export const {
    selectAll: selectAllUrbans,
    selectEntities: selectUrbansEntities,
    selectIds: selectUrbansIds,
    selectTotal: selectUrbansTotal
} = fromGeolocationCore.fromUrban.adapterUrban.getSelectors(getUrbanEntitiesState);

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

export const getSelectedUrbanEntity = createSelector(
    getUrbanEntitiesState,
    getSelectedUrban,
    (state, urbanId) => state.entities[urbanId]
);

export const getUrbanTotal = createSelector(
    getUrbanEntitiesState,
    state => state.total
);
