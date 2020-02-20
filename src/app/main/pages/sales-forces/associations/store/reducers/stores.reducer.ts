import { createReducer, on } from '@ngrx/store';
import { EntityState, createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { environment } from '../../../../../../../environments/environment';
import { StoreActions } from '../actions';
import { Store } from 'app/shared/models';

// Set reducer's feature key
export const featureKey = 'stores';

/**
 * Interface's state.
 */
export interface State extends EntityState<Store> {
    isLoading: boolean;
    needRefresh: boolean;
    // selectedIds: Array<string>;
    // search: string;
    total: number;
}

// Entity Adapter for the Entity State.
export const adapter: EntityAdapter<Store> = createEntityAdapter<Store>({
    selectId: store => store.id,
});

// Set the reducer's initial state.
export const initialState = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    needRefresh: false,
    // selectedIds: [],
    // search: null,
    total: 0,
});

// Create the reducer.
export const reducer = createReducer(
    initialState,
    on(
        StoreActions.fetchStoreRequest,
        StoreActions.fetchStoresRequest,
        state => ({
            ...state,
            isLoading: true
        })
    ),
    on(
        StoreActions.fetchStoreFailure,
        StoreActions.fetchStoresFailure,
        (state) => ({
            ...state,
            isLoading: false
        })
    ),
    on(
        StoreActions.fetchStoreSuccess,
        (state, { payload }) =>
            adapter.upsertOne(payload.store, {
                ...state,
                isLoading: false
            })
    ),
    on(
        StoreActions.fetchStoresSuccess,
        (state, { payload }) =>
            adapter.upsertMany(payload.stores, {
                ...state,
                isLoading: false,
                total: payload.total
            })
    ),
    on(
        StoreActions.addSelectedStores,
        (state, { payload }) => {
            const newStores = (payload as Array<Store>).map(store => {
                const newStore = new Store(store);
                newStore.setSelectedStore = true;
                return newStore;
            });

            return adapter.upsertMany(newStores, {
                ...state,
            });
        }
    ),
    on(
        StoreActions.removeSelectedStores,
        (state, { payload }) => adapter.removeMany(payload, {
            ...state
        })
    ),
    on(
        StoreActions.markStoreAsRemoved,
        (state, { payload }) => {
            const newStore = new Store(state.entities[payload]);
            newStore.setDeletedAt = new Date().toISOString();

            return adapter.upsertOne(newStore, state);
        }
    ),
    on(
        StoreActions.markStoresAsRemoved,
        (state, { payload }) => {
            const newStore: Array<Store> = [];
            
            for (const storeId of payload) {
                const _store = new Store(state.entities[storeId]);
                _store.setDeletedAt = new Date().toISOString();

                newStore.push(_store);
            }

            return adapter.upsertMany(newStore, state);
        }
    ),
    on(
        StoreActions.abortStoreAsRemoved,
        (state, { payload }) => {
            const newStore = new Store(state.entities[payload]);
            newStore.setDeletedAt = null;

            return adapter.upsertOne(newStore, state);
        }
    ),
    on(
        StoreActions.abortStoresAsRemoved,
        (state, { payload }) => {
            const newStore: Array<Store> = [];
            
            for (const storeId of payload) {
                const _store = new Store(state.entities[storeId]);
                _store.setDeletedAt = null;

                newStore.push(_store);
            }

            return adapter.upsertMany(newStore, state);
        }
    ),
    on(
        StoreActions.truncateStores,
        (state) => adapter.removeAll({
            ...state, total: 0
        })
    ),
);
