import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { StoreType } from '../../models';
import { StoreTypeActions } from '../actions';

// Keyname for reducer
export const featureKey = 'storeTypes';

export interface State extends EntityState<StoreType> {
    isLoading: boolean;
    isLoadingRow: boolean;
    isRefresh: boolean;
    selectedId: string;
    deepestLevel: number;
}

// Adapter for store types state
export const adapter = createEntityAdapter<StoreType>({ selectId: row => row.id });

// Initialize state
export const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    isLoadingRow: false,
    isRefresh: undefined,
    selectedId: null,
    deepestLevel: 0
});

// Reducer manage the action
export const reducer = createReducer<State>(
    initialState,
    on(StoreTypeActions.createStoreTypeRequest, state => ({ ...state, isLoadingRow: true })),
    on(StoreTypeActions.createStoreTypeFailure, state => ({ ...state, isRefresh: true })),
    on(StoreTypeActions.refreshStoreTypesRequest, state => ({ ...state, isRefresh: false })),
    on(StoreTypeActions.refreshStoreTypesFailure, state => ({
        ...state,
        isLoadingRow: false
    })),
    on(StoreTypeActions.fetchStoreTypesRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(StoreTypeActions.fetchStoreTypesFailure, state => ({
        ...state,
        isLoading: false
    })),
    on(StoreTypeActions.createStoreTypeSuccess, state => ({ ...state, isRefresh: true })),
    on(StoreTypeActions.fetchStoreTypesSuccess, (state, { payload }) =>
        adapter.addAll(payload.data, {
            ...state,
            isLoading: false,
            deepestLevel: payload.deepestLevel
        })
    ),
    on(StoreTypeActions.refreshStoreTypesSuccess, (state, { payload }) =>
        adapter.upsertMany(payload.data, {
            ...state,
            isLoadingRow: false,
            deepestLevel: payload.deepestLevel
        })
    ),
    on(StoreTypeActions.clearState, state =>
        adapter.removeAll({
            ...state,
            isLoading: false,
            selectedId: null,
            deepestLevel: 0
        })
    )
);
