import { GeolocationActions } from '../actions';
import { createReducer, on } from '@ngrx/store';
import { EntityState, createEntityAdapter } from '@ngrx/entity';

// Keyname for reducer
export const featureKey = 'districts';

export interface State extends EntityState<string> {
    isLoading: boolean;
    needRefresh: boolean;
    selected: string;
    total: number;
}

// Adapter for district state
export const adapterDistrict = createEntityAdapter<string>({ selectId: row => row });
// Initialize district state
const districtInitialState: State = adapterDistrict.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    needRefresh: false,
    selected: null,
    total: 0
});

// Reducer manage the action
export const reducer = createReducer<State>(
    districtInitialState,
    on(
        GeolocationActions.fetchDistrictsRequest,
        state => ({
            ...state,
            isLoading: true
        })
    ),
    on(
        GeolocationActions.fetchDistrictsFailure,
        state => ({
            ...state,
            total: 0,
            isLoading: false
        })
    ),
    on(
        GeolocationActions.fetchDistrictsSuccess,
        (state, { payload }) => adapterDistrict.upsertMany(payload.districts, {
            ...state,
            isLoading: false,
            total: payload.total,
        })
    ),
    on(
        GeolocationActions.selectDistrict,
        (state, { payload }) => ({
            ...state,
            selected: payload
        })
    ),
    on(
        GeolocationActions.deselectDistrict,
        state => ({
            ...state,
            selected: null
        })
    ),
    on(
        GeolocationActions.truncateDistricts,
        state => adapterDistrict.removeAll({
            ...state,
            total: 0,
        })
    ),
);
