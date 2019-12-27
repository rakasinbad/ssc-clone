import { createReducer, on } from '@ngrx/store';
import { EntityState, createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { StoreActions } from '../actions';
import { Store } from 'app/main/pages/attendances/models';

// Set reducer's feature key
export const featureKey = 'stores';
/**
 * Interface's state.
 */
export interface State extends EntityState<Store> {
    isLoading: boolean;
    needRefresh: boolean;
    selectedIds: Array<string>;
    total: number;
}

// Entity Adapter for the Entity State.
export const adapter: EntityAdapter<Store> = createEntityAdapter<Store>({
    selectId: portfolio => portfolio.id,
});

// Set the reducer's initial state.
export const initialState = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    needRefresh: false,
    selectedIds: [],
    total: 0,
});

// Create the reducer.
export const reducer = createReducer(
    initialState,
    on(
        StoreActions.fetchStoresRequest,
        state => ({
            ...state,
            isLoading: true
        })
    ),
    on(
        StoreActions.fetchStoresSuccess,
        (state, { payload }) =>
            adapter.addAll(payload.stores, {
                ...state,
                isLoading: false,
                total: payload.total
            })
    ),
    on(
        StoreActions.addSelectedStores,
        (state, { payload }) => adapter.upsertMany(payload, {
            ...state
        })
    ),
    on(
        StoreActions.removeSelectedStores,
        (state, { payload }) => adapter.removeMany(payload, {
            ...state
        })
    ),
);
