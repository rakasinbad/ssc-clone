import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Temperature } from 'app/shared/models';
import { TemperatureActions } from 'app/shared/store/actions';

// Keyname for reducer
const featureKey = 'temperatures';

/**
 *
 * Main interface for reducer
 * @interface State
 * @extends {EntityState<Temperature>}
 */
interface State extends EntityState<Temperature> {
    isRefresh?: boolean;
    isLoading: boolean;
    selectedId: string;
    total: number;
}

// Adapter for temperatures state
const adapter = createEntityAdapter<Temperature>({ selectId: row => row.id });

// Initialize state
const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    selectedId: null,
    total: 0
});

// Reducer manage the action
const reducer = createReducer<State>(
    initialState,
    on(TemperatureActions.fetchTemperatureRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(TemperatureActions.fetchTemperatureFailure, state => ({
        ...state,
        isLoading: false
    })),
    on(TemperatureActions.fetchTemperatureSuccess, (state, { payload }) => {
        return adapter.addAll(payload, {
            ...state,
            isLoading: false,
            selectedId: null
        });
    }),
    on(TemperatureActions.clearTemperatureState, state => {
        return adapter.removeAll({ ...state, isLoading: false, selectedId: null, total: 0 });
    })
);

// Set anything for the export
export { adapter, featureKey, initialState, reducer, State };
