import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { StoreType } from '../../models';
import { StoreTypeActions } from '../actions';

// Keyname for reducer
export const featureKey = 'storeTypes';

export interface State extends EntityState<StoreType> {
    isError: boolean;
    isLoading: boolean;
    isLoadingRow: boolean;
    isRefresh: boolean;
    selectedId: string;
    deepestLevel: number;
    deactiveItem: boolean;
}

// Adapter for store types state
export const adapter = createEntityAdapter<StoreType>({ selectId: row => row.id });

// Initialize state
export const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isError: false,
    isLoading: false,
    isLoadingRow: false,
    isRefresh: undefined,
    selectedId: null,
    deepestLevel: 0,
    deactiveItem: false,
});

// Reducer manage the action
export const reducer = createReducer<State>(
    initialState,
    on(StoreTypeActions.cancelConfirmChangeStatusStoreType, state => ({
        ...state,
        isLoadingRow: true,
        isRefresh: true
    })),
    on(StoreTypeActions.createStoreTypeRequest, StoreTypeActions.updateStoreTypeRequest, state => ({
        ...state,
        selectedId: null,
        deactiveItem: false,
        isError: false,
        isLoadingRow: true
    })),
    on(StoreTypeActions.createStoreTypeFailure, StoreTypeActions.updateStoreTypeFailure, state => ({
        ...state,
        isRefresh: true,
        isError: true,
    })),
    on(StoreTypeActions.refreshStoreTypesRequest, state => ({ ...state, isRefresh: false })),
    on(StoreTypeActions.refreshStoreTypesFailure, state => ({
        ...state,
        isLoadingRow: false
    })),
    on(StoreTypeActions.fetchStoreTypesRequest, state => ({ ...state, isLoading: true })),
    on(StoreTypeActions.fetchStoreTypesFailure, state => ({ ...state, isLoading: false })),
    on(StoreTypeActions.createStoreTypeSuccess, state => ({ ...state, isRefresh: true })),
    on(StoreTypeActions.updateStoreTypeSuccess, (state, { payload }) => ({
        ...state,
        selectedId: payload.id,
        deactiveItem: payload.deactive,
        isRefresh: true
    })),
    on(StoreTypeActions.fetchStoreTypesSuccess, (state, { payload }) =>
        adapter.addAll(payload.data, {
            ...state,
            isLoading: false,
            deepestLevel: payload.deepestLevel
        })
    ),
    on(StoreTypeActions.refreshStoreTypesSuccess, (state, { payload }) =>
        adapter.addAll(payload.data, {
            ...state,
            isLoadingRow: false,
            deepestLevel: payload.deepestLevel
        })
    ),
    on(StoreTypeActions.clearState, state =>
        adapter.removeAll({
            ...state,
            isError: false,
            isLoading: false,
            isRefresh: undefined,
            selectedId: null,
            deepestLevel: 0,
            deactiveItem: false,
        })
    )
);
