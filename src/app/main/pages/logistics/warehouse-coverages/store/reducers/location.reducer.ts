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
export const adapterCity = createEntityAdapter<string>();
// Initialize city state
const cityInitialState: CityState = adapterCity.getInitialState<Omit<CityState, 'ids' | 'entities'>>({
    isLoading: false,
    needRefresh: false,
    selected: null,
    total: 0
});

// Adapter for district state
export const adapterDistrict = createEntityAdapter<string>();
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
        LocationActions.fetchCitiesRequest,
        LocationActions.fetchDistrictsRequest,
        state => ({
            ...state,
            isLoading: true
        })
    ),
    on(
        LocationActions.fetchProvincesFailure,
        LocationActions.fetchCitiesFailure,
        LocationActions.fetchDistrictsFailure,
        state => ({
            ...state,
            isLoading: false
        })
    ),
    on(
        LocationActions.fetchProvincesSuccess,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            province: adapterProvince.upsertMany(payload.data, {
                ...state.province
            })
        })
    ),
    on(
        LocationActions.fetchCitiesSuccess,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            city: adapterCity.upsertMany(payload.cities, {
                ...state.city
            })
        })
    ),
    on(
        LocationActions.fetchDistrictsSuccess,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            district: adapterDistrict.upsertMany(payload.districts, {
                ...state.district
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
                selected: null
            })
        })
    ),
    on(
        LocationActions.truncateCities,
        state => ({
            ...state,
            city: adapterCity.removeAll({
                ...state.city,
                selected: null
            })
        })
    ),
    on(
        LocationActions.truncateDistricts,
        state => ({
            ...state,
            district: adapterDistrict.removeAll({
                ...state.district,
                selected: null
            })
        })
    ),
);
