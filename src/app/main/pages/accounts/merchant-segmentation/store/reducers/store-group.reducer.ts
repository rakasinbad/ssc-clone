import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { StoreGroup } from '../../models';
import { StoreGroupActions } from '../actions';

// Keyname for reducer
export const featureKey = 'storeGroups';

export interface State extends EntityState<StoreGroup> {
    isLoading: boolean;
    isLoadingRow: boolean;
    isRefresh: boolean;
    selectedId: string;
    deepestLevel: number;
}

// Adapter for store types state
export const adapter = createEntityAdapter<StoreGroup>({ selectId: row => row.id });

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
    on(
        StoreGroupActions.createStoreGroupRequest,
        StoreGroupActions.updateStoreGroupRequest,
        state => ({ ...state, isLoadingRow: true })
    ),
    on(
        StoreGroupActions.createStoreGroupFailure,
        StoreGroupActions.updateStoreGroupFailure,
        state => ({ ...state, isRefresh: true })
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
        StoreGroupActions.updateStoreGroupSuccess,
        state => ({ ...state, isRefresh: true })
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
            isLoading: false,
            isRefresh: undefined,
            selectedId: null,
            deepestLevel: 0
        })
    )
);
