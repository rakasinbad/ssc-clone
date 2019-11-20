import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as _ from 'lodash';

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

export const getRoleDropdownState = createSelector(getDropdownState, state => {
    return state.roles && state.roles.length > 0 ? _.sortBy(state.roles, ['role'], ['asc']) : [];
});

export const getProvinceDropdownState = createSelector(getDropdownState, state =>
    state.provinces && state.provinces.length > 0
        ? _.sortBy(state.provinces, ['name'], ['asc'])
        : state.provinces
);

export const getCityDropdownState = createSelector(
    getDropdownState,
    (state: fromDropdown.State, { provinceId }) => {
        const idx = state.provinces.findIndex(row => row.id === provinceId);

        if (idx !== -1) {
            const selectedProv = state.provinces[idx];
            return _.sortBy(_.uniqBy(selectedProv.urbans, 'city'), ['city'], ['asc']);
        }
    }
);

export const getDistrictDropdownState = createSelector(
    getDropdownState,
    (state: fromDropdown.State, { provinceId, city }) => {
        const idx = state.provinces.findIndex(row => row.id === provinceId);

        if (idx !== -1) {
            const selectedProv = state.provinces[idx];
            const selectedCity = selectedProv.urbans.filter(row => row.city === city);
            return _.sortBy(_.unionBy(selectedCity, 'district'), ['district'], ['asc']);
        }
    }
);

export const getUrbanDropdownState = createSelector(
    getDropdownState,
    (state: fromDropdown.State, { provinceId, city, district }) => {
        const idx = state.provinces.findIndex(row => row.id === provinceId);

        if (idx !== -1) {
            const selectedProv = state.provinces[idx];
            const selectedDistrict = selectedProv.urbans.filter(
                row => row.city === city && row.district === district
            );
            return _.sortBy(_.unionBy(selectedDistrict, 'urban'), ['urban'], ['asc']);
        }
    }
);

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

export const getStoreClusterDropdownState = createSelector(getDropdownState, state =>
    state.storeClusters && state.storeClusters.length > 0
        ? _.sortBy(state.storeClusters, ['name'], ['asc'])
        : state.storeClusters
);

export const getStoreGroupDropdownState = createSelector(getDropdownState, state =>
    state.storeGroups && state.storeGroups.length > 0
        ? _.sortBy(state.storeGroups, ['name'], ['asc'])
        : state.storeGroups
);

export const getStoreSegmentDropdownState = createSelector(getDropdownState, state =>
    state.storeSegments && state.storeSegments.length > 0
        ? _.sortBy(state.storeSegments, ['name'], ['asc'])
        : state.storeSegments
);

export const getStoreTypeDropdownState = createSelector(getDropdownState, state =>
    state.storeTypes && state.storeTypes.length > 0
        ? _.sortBy(state.storeTypes, ['name'], ['asc'])
        : state.storeTypes
);

export const getVehicleAccessibilityDropdownState = createSelector(getDropdownState, state =>
    state.vehicleAccessibilities && state.vehicleAccessibilities.length > 0
        ? _.sortBy(state.vehicleAccessibilities, ['name'], ['asc'])
        : state.vehicleAccessibilities
);

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
