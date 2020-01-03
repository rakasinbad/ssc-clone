import { createReducer, on } from '@ngrx/store';
import { EntityState, createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { StoreActions } from '../actions';
import { Store } from 'app/main/pages/attendances/models';
import { Filter } from '../../models';

// Set reducer's feature key
export const featureKey = 'stores';
/**
 * Interface's state.
 */
export interface State extends EntityState<Store> {
    isLoading: boolean;
    needRefresh: boolean;
    selectedIds: Array<string>;
    filter: EntityState<Filter>;
    type: string; // Jenis store yang sedang ada di dalam state.
    total: number;
}

export const adapterFilter: EntityAdapter<Filter> = createEntityAdapter<Filter>({
    selectId: filter => filter.id
});

// Entity Adapter for the Entity State.
export const adapter: EntityAdapter<Store> = createEntityAdapter<Store>({
    selectId: portfolio => portfolio.id,
});

// Set the reducer's initial state.
export const initialState = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    needRefresh: false,
    selectedIds: [],
    filter: adapterFilter.getInitialState(),
    type: 'all',
    total: 0,
});

// Create the reducer.
export const reducer = createReducer(
    initialState,
    on(
        StoreActions.applyStoreFilter,
        (state, { payload }) => ({
            ...state,
            filter: adapterFilter.upsertMany(payload, state.filter)
        })
    ),
    on(
        StoreActions.removeStoreFilter,
        (state, { payload }) => ({
            ...state,
            filter: adapterFilter.removeOne(payload, state.filter)
        })
    ),
    on(
        StoreActions.removeAllStoreFilters,
        (state) => ({
            ...state,
            filter: adapterFilter.removeAll(state.filter)
        })
    ),
    on(
        StoreActions.setStoreEntityType,
        (state, { payload }) => ({
            ...state,
            type: payload
        })
    ),
    on(
        StoreActions.fetchStoresRequest,
        (state, { payload }) => ({
            ...state,
            type: payload['type'],
            isLoading: true
        })
    ),
    on(
        StoreActions.fetchStoresFailure,
        (state) => ({
            ...state,
            isLoading: false
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
