import { GeolocationActions } from '../actions';
import { createReducer, on } from '@ngrx/store';
import { EntityState, createEntityAdapter } from '@ngrx/entity';

// Keyname for reducer
export const featureKey = 'cities';

export interface State extends EntityState<string> {
    isLoading: boolean;
    needRefresh: boolean;
    selected: string;
    total: number;
}

// Adapter for city state
export const adapterCity = createEntityAdapter<string>({ selectId: row => row });
// Initialize city state
const cityInitialState: State = adapterCity.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    needRefresh: false,
    selected: null,
    total: 0
});

// Reducer manage the action
export const reducer = createReducer<State>(
    cityInitialState,
    on(
        GeolocationActions.fetchCitiesRequest,
        state => ({
            ...state,
            isLoading: true
        })
    ),
    on(
        GeolocationActions.fetchCitiesFailure,
        state => ({
            ...state,
            total: 0,
            isLoading: false
        })
    ),
    on(
        GeolocationActions.fetchCitiesSuccess,
        (state, { payload }) => adapterCity.upsertMany(payload.cities, {
            ...state,
            isLoading: false,
            total: payload.total,
        })
    ),
    on(
        GeolocationActions.selectCity,
        (state, { payload }) => ({
            ...state,
            selected: payload
        })
    ),
    on(
        GeolocationActions.deselectCity,
        state => ({
            ...state,
            selected: null
        })
    ),
    on(
        GeolocationActions.truncateCities,
        state => adapterCity.removeAll({
            ...state,
            total: 0,
        })
    ),
);
