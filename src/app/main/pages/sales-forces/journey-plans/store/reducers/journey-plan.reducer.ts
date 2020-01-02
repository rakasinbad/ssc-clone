import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer } from '@ngrx/store';

// Keyname for reducer
const featureKey = 'journeyPlans';

/**
 *
 * Main interface for reducer
 * @interface State
 * @extends {EntityState<any>}
 */
interface State extends EntityState<any> {
    isRefresh?: boolean;
    isLoading: boolean;
    selectedId: string;
    total: number;
}

// Adapter for journeyPlans state
const adapter = createEntityAdapter<any>({ selectId: row => row.id });

// Initialize state
const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    selectedId: null,
    total: 0
});

// Reducer manage the action
const reducer = createReducer<State>(initialState);

// Set anything for the export
export { adapter, featureKey, initialState, reducer, State };
