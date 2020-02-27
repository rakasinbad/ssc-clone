import { WarehouseCoverageActions, LocationActions } from '../actions';
import { createReducer, on } from '@ngrx/store';
import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { Province } from 'app/shared/models';

// Keyname for reducer
export const featureKey = 'locations';

interface ProvinceState extends EntityState<Province> {
    isLoading: boolean;
    needRefresh: boolean;
    selected: string;
    total: number;
}

interface CityState extends EntityState<string> {
    isLoading: boolean;
    needRefresh: boolean;
    selected: string;
    total: number;
}

interface DistrictState extends EntityState<string> {
    isLoading: boolean;
    needRefresh: boolean;
    selected: string;
    total: number;
}

export interface LocationState {
    province: ProvinceState;
    city: CityState;
    district: DistrictState;
}

// Adapter for province state
export const adapterProvince = createEntityAdapter<Province>({ selectId: row => row.id });
// Initialize province state
const provinceInitialState: ProvinceState = adapterProvince.getInitialState<Omit<ProvinceState, 'ids' | 'entities'>>({
    isLoading: false,
    needRefresh: false,
    selected: null,
    total: 0
});

// Adapter for city state
export const adapterCity = createEntityAdapter<string>({ selectId: row => row });
// Initialize city state
const cityInitialState: CityState = adapterCity.getInitialState<Omit<CityState, 'ids' | 'entities'>>({
    isLoading: false,
    needRefresh: false,
    selected: null,
    total: 0
});

// Adapter for district state
export const adapterDistrict = createEntityAdapter<string>({ selectId: row => row });
// Initialize city state
const districtInitialState: DistrictState = adapterDistrict.getInitialState<Omit<DistrictState, 'ids' | 'entities'>>({
    isLoading: false,
    needRefresh: false,
    selected: null,
    total: 0
});

// Initial state
export const initialState: LocationState = {
    city: cityInitialState,
    district: districtInitialState,
    province: provinceInitialState,
};

// Reducer manage the action
export const reducer = createReducer<LocationState>(
    initialState,
    on(
        LocationActions.fetchProvincesRequest,
        state => ({
            ...state,
            province: {
                ...state.province,
                isLoading: true
            }
        })
    ),
    on(
        LocationActions.fetchProvincesFailure,
        state => ({
            ...state,
            province: {
                ...state.province,
                isLoading: false
            }
        })
    ),
    on(
        LocationActions.fetchCitiesRequest,
        state => ({
            ...state,
            city: {
                ...state.city,
                isLoading: true
            }
        })
    ),
    on(
        LocationActions.fetchCitiesFailure,
        state => ({
            ...state,
            city: {
                ...state.city,
                isLoading: false
            }
        })
    ),
    on(
        LocationActions.fetchDistrictsRequest,
        state => ({
            ...state,
            district: {
                ...state.district,
                isLoading: true
            }
        })
    ),
    on(
        LocationActions.fetchDistrictsFailure,
        state => ({
            ...state,
            district: {
                ...state.district,
                isLoading: false
            }
        })
    ),
    on(
        LocationActions.fetchProvincesSuccess,
        (state, { payload }) => ({
            ...state,
            province: adapterProvince.upsertMany(payload.data, {
                ...state.province,
                isLoading: false,
                total: payload.total,
            })
        })
    ),
    on(
        LocationActions.fetchCitiesSuccess,
        (state, { payload }) => ({
            ...state,
            city: adapterCity.upsertMany(payload.cities, {
                ...state.city,
                isLoading: false,
                total: payload.total,
            })
        })
    ),
    on(
        LocationActions.fetchDistrictsSuccess,
        (state, { payload }) => ({
            ...state,
            district: adapterDistrict.upsertMany(payload.districts, {
                ...state.district,
                isLoading: false,
                total: payload.total,
            })
        })
    ),
    on(
        LocationActions.selectProvince,
        (state, { payload }) => ({
            ...state,
            province: {
                ...state.province,
                selected: payload
            }
        })
    ),
    on(
        LocationActions.deselectProvince,
        state => ({
            ...state,
            province: {
                ...state.province,
                selected: null
            }
        })
    ),
    on(
        LocationActions.selectCity,
        (state, { payload }) => ({
            ...state,
            city: {
                ...state.city,
                selected: payload
            }
        })
    ),
    on(
        LocationActions.deselectCity,
        state => ({
            ...state,
            city: {
                ...state.city,
                selected: null
            }
        })
    ),
    on(
        LocationActions.selectDistrict,
        (state, { payload }) => ({
            ...state,
            district: {
                ...state.district,
                selected: payload
            }
        })
    ),
    on(
        LocationActions.deselectDistrict,
        state => ({
            ...state,
            district: {
                ...state.district,
                selected: null
            }
        })
    ),
    on(
        LocationActions.truncateProvinces,
        state => ({
            ...state,
            province: adapterProvince.removeAll({
                ...state.province,
            })
        })
    ),
    on(
        LocationActions.truncateCities,
        state => ({
            ...state,
            city: adapterCity.removeAll({
                ...state.city,
            })
        })
    ),
    on(
        LocationActions.truncateDistricts,
        state => ({
            ...state,
            district: adapterDistrict.removeAll({
                ...state.district,
            })
        })
    ),
);
