import { GeolocationActions } from '../actions';
import { createReducer, on } from '@ngrx/store';
import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { Province } from 'app/shared/models/location.model';

// Keyname for reducer
export const featureKey = 'provinces';

export interface State extends EntityState<Province> {
    isLoading: boolean;
    needRefresh: boolean;
    selected: string;
    total: number;
}

// Adapter for province state
export const adapterProvince = createEntityAdapter<Province>({ selectId: row => row.id });
// Initialize province state
const provinceInitialState: State = adapterProvince.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    needRefresh: false,
    selected: null,
    total: 0
});

// Reducer manage the action
export const reducer = createReducer<State>(
    provinceInitialState,
    on(
        GeolocationActions.fetchProvincesRequest,
        state => ({
            ...state,
            isLoading: true
        })
    ),
    on(
        GeolocationActions.fetchProvincesFailure,
        state => ({
            ...state,
            total: 0,
            isLoading: false
        })
    ),
    on(
        GeolocationActions.fetchProvincesSuccess,
        (state, { payload }) => adapterProvince.upsertMany(payload.data, {
            ...state,
            isLoading: false,
            total: payload.total,
        })
    ),
    on(
        GeolocationActions.selectProvince,
        (state, { payload }) => ({
            ...state,
            selected: payload
        })
    ),
    on(
        GeolocationActions.deselectProvince,
        state => ({
            ...state,
            selected: null
        })
    ),
    on(
        GeolocationActions.truncateProvinces,
        state => adapterProvince.removeAll({
            ...state,
            total: 0,
        })
    ),
);
