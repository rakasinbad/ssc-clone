import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { Store } from '../../models';
import { StoreActions } from '../actions';

// Keyname for reducer
const featureKey = 'stores';

/**
 *
 * Main interface for reducer
 * @interface State
 * @extends {EntityState<Store>}
 */
interface State extends EntityState<Store> {
    isRefresh?: boolean;
    isLoading: boolean;
    selectedId: string;
    total: number;
}

// Adapter for Stores state
const adapter = createEntityAdapter<Store>({ selectId: row => row.id });

// Initialize state
const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    isRefresh: false,
    selectedId: null,
    total: 0
});

// Reducer manage the action
const reducer = createReducer<State>(
    initialState,
    on(StoreActions.fetchStoresRequest, state => ({
        ...state,
        isLoading: true,
    })),
    on(StoreActions.fetchStoresFailure, state => ({
        ...state,
        isLoading: false
    })),
    on(StoreActions.fetchStoresSuccess, (state, { payload }) =>
        adapter.upsertMany(payload.data, {
            ...state,
            isLoading: false,
            isRefresh: true,
            total: payload.total
        })
    ),
    on(StoreActions.clearState, state =>
        adapter.removeAll({
            ...state,
            isLoading: false,
            isRefresh: false,
            selectedId: null,
            total: 0
        })
    )
);

// Set anything for the export
export { adapter, featureKey, initialState, reducer, State };
