import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GeoParameterType } from 'app/shared/models';
import { sortBy, unionBy, uniqBy } from 'lodash';

import { fromDropdown } from '../reducers';

export const getDropdownState = createFeatureSelector<fromDropdown.State>(fromDropdown.FEATURE_KEY);

// export const getSearchState = createSelector(
//     getDropdownState,
//     state => state.search
// );

// export const getSearchAccountState = createSelector(
//     getSearchState,
//     state => state.accounts
// );

// export const getAllSearchAccount = createSelector(
//     getDropdownState,
//     fromDropdown.selectAllSearchAccounts
// );

// -----------------------------------------------------------------------------------------------------
// Geo Parameters State [Province]
// -----------------------------------------------------------------------------------------------------

export const getAllGeoParameter = createSelector(
    getDropdownState,
    fromDropdown.selectAllGeoParameter
);

export const getGeoParameterEntities = createSelector(
    getDropdownState,
    fromDropdown.selectGeoParameterEntities
);

export const getTotalGeoParameterEntity = createSelector(
    getDropdownState,
    fromDropdown.selectGeoParameterTotal
);

export const getSelectedGeoParameterId = createSelector(
    getDropdownState,
    state => state.geoParameters.selectedId
);

export const getSelectedGeoParameter = createSelector(
    getGeoParameterEntities,
    getSelectedGeoParameterId,
    (entities, id) => entities[id]
);

export const getGeoParameterProvince = createSelector(
    getGeoParameterEntities,
    entities => entities[GeoParameterType.PROVINCE]
);

export const getGeoParameterCity = createSelector(
    getGeoParameterEntities,
    entities => entities[GeoParameterType.CITY]
);

// -----------------------------------------------------------------------------------------------------
// Hierarchies State
// -----------------------------------------------------------------------------------------------------

export const getHierarchyDropdownState = createSelector(getDropdownState, state => {
    return state.hierarchies && state.hierarchies.length > 0
        ? sortBy(state.hierarchies, ['name'], ['asc'])
        : [];
});

// -----------------------------------------------------------------------------------------------------
// Roles State
// -----------------------------------------------------------------------------------------------------

export const getRoleDropdownState = createSelector(getDropdownState, state => {
    return state.roles && state.roles.length > 0 ? sortBy(state.roles, ['role'], ['asc']) : [];
});

// -----------------------------------------------------------------------------------------------------
// Provinces State
// -----------------------------------------------------------------------------------------------------

export const getProvinceDropdownState = createSelector(getDropdownState, state =>
    state.provinces && state.provinces.length > 0
        ? sortBy(state.provinces, ['name'], ['asc'])
        : state.provinces
);

// -----------------------------------------------------------------------------------------------------
// Provinces State Get Cities
// -----------------------------------------------------------------------------------------------------

export const getCityDropdownState = createSelector(
    getDropdownState,
    (state: fromDropdown.State, { provinceId }) => {
        const idx = state.provinces.findIndex(row => row.id === provinceId);

        if (idx !== -1) {
            const selectedProv = state.provinces[idx];
            return sortBy(uniqBy(selectedProv.urbans, 'city'), ['city'], ['asc']);
        }
    }
);

// -----------------------------------------------------------------------------------------------------
// Provinces State Get Districts
// -----------------------------------------------------------------------------------------------------

export const getDistrictDropdownState = createSelector(
    getDropdownState,
    (state: fromDropdown.State, { provinceId, city }) => {
        const idx = state.provinces.findIndex(row => row.id === provinceId);

        if (idx !== -1) {
            const selectedProv = state.provinces[idx];
            const selectedCity = selectedProv.urbans.filter(row => row.city === city);
            return sortBy(unionBy(selectedCity, 'district'), ['district'], ['asc']);
        }
    }
);

// -----------------------------------------------------------------------------------------------------
// Provinces State Get Urbans
// -----------------------------------------------------------------------------------------------------

export const getUrbanDropdownState = createSelector(
    getDropdownState,
    (state: fromDropdown.State, { provinceId, city, district }) => {
        const idx = state.provinces.findIndex(row => row.id === provinceId);

        if (idx !== -1) {
            const selectedProv = state.provinces[idx];
            const selectedDistrict = selectedProv.urbans.filter(
                row => row.city === city && row.district === district
            );
            return sortBy(unionBy(selectedDistrict, 'urban'), ['urban'], ['asc']);
        }
    }
);

// -----------------------------------------------------------------------------------------------------
// Provinces State Get Postcode
// -----------------------------------------------------------------------------------------------------

export const getPostcodeDropdownState = createSelector(
    getDropdownState,
    (state: fromDropdown.State, { provinceId, city, district, urbanId }) => {
        const idx = state.provinces.findIndex(row => row.id === provinceId);

        if (idx !== -1) {
            const selectedProv = state.provinces[idx];
            const urbanIdx = selectedProv.urbans.findIndex(
                row => row.city === city && row.district === district && row.id === urbanId
            );

            if (urbanIdx !== -1) {
                return selectedProv.urbans[urbanIdx].zipCode;
            }
        }
    }
);

// -----------------------------------------------------------------------------------------------------
// Store Clusters State
// -----------------------------------------------------------------------------------------------------

export const getStoreClusterDropdownState = createSelector(getDropdownState, state =>
    state.storeClusters && state.storeClusters.length > 0
        ? sortBy(state.storeClusters, ['name'], ['asc'])
        : state.storeClusters
);

// -----------------------------------------------------------------------------------------------------
// Store Groups State
// -----------------------------------------------------------------------------------------------------

export const getStoreGroupDropdownState = createSelector(getDropdownState, state =>
    state.storeGroups && state.storeGroups.length > 0
        ? sortBy(state.storeGroups, ['name'], ['asc'])
        : state.storeGroups
);

// -----------------------------------------------------------------------------------------------------
// Store Segments State
// -----------------------------------------------------------------------------------------------------

export const getStoreSegmentDropdownState = createSelector(getDropdownState, state =>
    state.storeSegments && state.storeSegments.length > 0
        ? sortBy(state.storeSegments, ['name'], ['asc'])
        : state.storeSegments
);

// -----------------------------------------------------------------------------------------------------
// Store Types State
// -----------------------------------------------------------------------------------------------------

export const getStoreTypeDropdownState = createSelector(getDropdownState, state =>
    state.storeTypes && state.storeTypes.length > 0
        ? sortBy(state.storeTypes, ['name'], ['asc'])
        : state.storeTypes
);

// -----------------------------------------------------------------------------------------------------
// Vehicle Accessibilities State
// -----------------------------------------------------------------------------------------------------

export const getVehicleAccessibilityDropdownState = createSelector(getDropdownState, state =>
    state.vehicleAccessibilities && state.vehicleAccessibilities.length > 0
        ? sortBy(state.vehicleAccessibilities, ['name'], ['asc'])
        : state.vehicleAccessibilities
);

// -----------------------------------------------------------------------------------------------------
// Errors State
// -----------------------------------------------------------------------------------------------------

export const getAllError = createSelector(getDropdownState, fromDropdown.selectAllError);

export const getErrorEntities = createSelector(getDropdownState, fromDropdown.selectErrorEntities);

export const getTotalErrorEntity = createSelector(getDropdownState, fromDropdown.selectErrorTotal);

export const getSelectedErrorId = createSelector(
    getDropdownState,
    state => state.errors.selectedErrorId
);

export const getSelectedError = createSelector(
    getErrorEntities,
    getSelectedErrorId,
    (entities, id) => entities[id]
);

export const getSelectedErrorById = createSelector(getErrorEntities, (entities, { errorId }) => {
    console.log('SELECTOR', errorId, entities);
    return entities[errorId];
});

export const getIsError = createSelector(getErrorEntities, (entities, { errorId }) => {
    console.log('SELECTOR', errorId, entities, entities[errorId]);
    return entities[errorId] ? true : false;
});

/* export const getCityDropdownState = (provinceId: string) =>
    createSelector(
        getProvinceDropdownState,
        provinces => {
            if (provinces && provinces.length > 0) {
                return provinces
                    .filter(province => province.id === provinceId)
                    .map(row => row.urbans);
            }

            return null;
        }
    ); */

export const getRoleDropdownStateByType = (typeId: string) =>
    createSelector(getRoleDropdownState, roles => {
        return roles.length ? roles.filter(role => role.roleTypeId === typeId) : roles;
    });
