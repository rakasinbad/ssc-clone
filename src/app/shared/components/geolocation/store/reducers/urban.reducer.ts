import { GeolocationActions } from '../actions';
import { createReducer, on } from '@ngrx/store';
import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { Urban } from '../../models';

// Keyname for reducer
export const featureKey = 'urbans';

export interface State extends EntityState<Urban> {
    isLoading: boolean;
    needRefresh: boolean;
    selected: string;
    total: number;
}

// Adapter for urban state
export const adapterUrban = createEntityAdapter<Urban>({ selectId: row => row.id });
// Initialize urban state
const urbanInitialState: State = adapterUrban.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    needRefresh: false,
    selected: null,
    total: 0
});

// Reducer manage the action
export const reducer = createReducer<State>(
    urbanInitialState,
    on(
        GeolocationActions.fetchUrbansRequest,
        state => ({
            ...state,
            isLoading: true
        })
    ),
    on(
        GeolocationActions.fetchUrbansFailure,
        state => ({
            ...state,
            total: 0,
            isLoading: false
        })
    ),
    on(
        GeolocationActions.fetchUrbansSuccess,
        (state, { payload }) => adapterUrban.upsertMany(payload.urbans, {
            ...state,
            isLoading: false,
            total: payload.total,
        })
    ),
    on(
        GeolocationActions.selectUrban,
        (state, { payload }) => ({
            ...state,
            selected: payload
        })
    ),
    on(
        GeolocationActions.deselectUrban,
        state => ({
            ...state,
            selected: null
        })
    ),
    on(
        GeolocationActions.truncateUrbans,
        state => adapterUrban.removeAll({
            ...state,
            total: 0,
        })
    ),
);
