import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { Store } from 'app/shared/models';
import { AssociatedStoreActions } from '../actions';

// Keyname for reducer
const featureKey = 'associatedStores';

/**
 *
 * Main interface for reducer
 * @interface State
 * @extends {EntityState<Store>}
 */
interface State extends EntityState<Store> {
    isRefresh?: boolean;
    isLoading: boolean;
    initialized: boolean;
    selectedIds: Array<string>;
    total: number;
}

// Adapter for Store state
const adapter = createEntityAdapter<Store>({ selectId: row => row.id });

// Initialize state
const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    initialized: false,
    selectedIds: [],
    total: 0
});

// Reducer manage the action
const reducer = createReducer<State>(
    initialState,
    on(AssociatedStoreActions.fetchAssociatedStoresRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(AssociatedStoreActions.fetchAssociatedStoresFailure, state => ({
        ...state,
        isLoading: false
    })),
    on(AssociatedStoreActions.markInitialized, state => ({
        ...state,
        initialized: true
    })),
    on(AssociatedStoreActions.abortInitialized, state => ({
        ...state,
        initialized: false
    })),
    on(AssociatedStoreActions.fetchAssociatedStoresSuccess, (state, { payload }) => {
        return adapter.upsertMany(payload.data, {
            ...state,
            isLoading: false,
            total: payload.total
        });
    }),
    on(AssociatedStoreActions.addSelectedStores, (state, { payload }) => {
        return adapter.upsertMany(payload, {
            ...state,
        });
    }),
    on(AssociatedStoreActions.removeSelectedStores, (state, { payload }) => {
        return adapter.removeMany(payload, {
            ...state,
        });
    }),
    on(AssociatedStoreActions.markStoreAsRemoved, (state, { payload }) => {
        return adapter.upsertMany(payload.map(id => {
            const newStore = state.entities[id];
            newStore.isSelected = false;
            newStore.deletedAt = new Date().toISOString();

            return new Store(newStore);
        }), {
            ...state,
        });
    }),
    on(AssociatedStoreActions.abortStoreAsRemoved, (state, { payload }) => {
        return adapter.upsertMany(payload.map(id => {
            const newStore = state.entities[id];
            newStore.isSelected = true;
            newStore.deletedAt = null;

            return new Store(newStore);
        }), {
            ...state,
        });
    }),
    on(AssociatedStoreActions.clearAssociatedStores, (state) => adapter.removeAll(state))
);

// Set anything for the export
export { adapter, featureKey, initialState, reducer, State };
