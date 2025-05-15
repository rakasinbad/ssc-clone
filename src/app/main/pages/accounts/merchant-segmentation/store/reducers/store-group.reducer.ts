import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { StoreGroup } from '../../models';
import { StoreGroupActions } from '../actions';

// Keyname for reducer
export const featureKey = 'storeGroups';

export interface State extends EntityState<StoreGroup> {
    isError: boolean;
    isLoading: boolean;
    isLoadingRow: boolean;
    isRefresh: boolean;
    selectedId: string;
    deepestLevel: number;
    deactiveItem: boolean;
}

// Adapter for store types state
export const adapter = createEntityAdapter<StoreGroup>({ selectId: row => row.id });

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
    on(StoreGroupActions.cancelConfirmChangeStatusStoreGroup, state => ({
        ...state,
        isLoadingRow: true,
        isRefresh: true
    })),
    on(
        StoreGroupActions.createStoreGroupRequest,
        StoreGroupActions.updateStoreGroupRequest,
        state => ({ ...state, isError: false, isLoadingRow: true, deactiveItem: false, selectedId: null })
    ),
    on(
        StoreGroupActions.createStoreGroupFailure,
        StoreGroupActions.updateStoreGroupFailure,
        state => ({ ...state, isError: true, isRefresh: true })
    ),
    on(StoreGroupActions.refreshStoreGroupsRequest, state => ({
        ...state,
        isRefresh: false
    })),
    on(StoreGroupActions.refreshStoreGroupsFailure, state => ({
        ...state,
        isLoadingRow: false
    })),
    on(StoreGroupActions.fetchStoreGroupsRequest, state => ({ ...state, isLoading: true })),
    on(StoreGroupActions.fetchStoreGroupsFailure, state => ({ ...state, isLoading: false })),
    on(
        StoreGroupActions.createStoreGroupSuccess,
        state => ({ ...state, isRefresh: true })
    ),
    on(
        StoreGroupActions.updateStoreGroupSuccess,
        (state, { payload }) => ({ ...state, isRefresh: true, deactiveItem: payload.deactive, selectedId: payload.id })
    ),
    on(StoreGroupActions.fetchStoreGroupsSuccess, (state, { payload }) =>
        adapter.addAll(payload.data, {
            ...state,
            isLoading: false,
            deepestLevel: payload.deepestLevel
        })
    ),
    on(StoreGroupActions.refreshStoreGroupsSuccess, (state, { payload }) =>
        adapter.addAll(payload.data, {
            ...state,
            isLoadingRow: false,
            deepestLevel: payload.deepestLevel
        })
    ),
    on(StoreGroupActions.clearState, state =>
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
