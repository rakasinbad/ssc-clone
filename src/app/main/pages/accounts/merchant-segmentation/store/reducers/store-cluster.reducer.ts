import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { StoreCluster } from '../../models';
import { StoreClusterActions } from '../actions';

// Keyname for reducer
export const featureKey = 'storeClusters';

export interface State extends EntityState<StoreCluster> {
    isLoading: boolean;
    isLoadingRow: boolean;
    isRefresh: boolean;
    selectedId: string;
    deepestLevel: number;
}

// Adapter for storeClusters state
export const adapter = createEntityAdapter<StoreCluster>({ selectId: row => row.id });

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
    on(StoreClusterActions.cancelConfirmChangeStatusStoreCluster, state => ({
        ...state,
        isLoadingRow: true,
        isRefresh: true
    })),
    on(
        StoreClusterActions.createStoreClusterRequest,
        StoreClusterActions.updateStoreClusterRequest,
        state => ({ ...state, isLoadingRow: true })
    ),
    on(
        StoreClusterActions.createStoreClusterFailure,
        StoreClusterActions.updateStoreClusterFailure,
        state => ({ ...state, isRefresh: true })
    ),
    on(StoreClusterActions.refreshStoreClustersRequest, state => ({
        ...state,
        isRefresh: false
    })),
    on(StoreClusterActions.refreshStoreClustersFailure, state => ({
        ...state,
        isLoadingRow: false
    })),
    on(StoreClusterActions.fetchStoreClustersRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(StoreClusterActions.fetchStoreClustersFailure, state => ({
        ...state,
        isLoading: false
    })),
    on(
        StoreClusterActions.createStoreClusterSuccess,
        StoreClusterActions.updateStoreClusterSuccess,
        state => ({ ...state, isRefresh: true })
    ),
    on(StoreClusterActions.fetchStoreClustersSuccess, (state, { payload }) =>
        adapter.addAll(payload.data, {
            ...state,
            isLoading: false,
            deepestLevel: payload.deepestLevel
        })
    ),
    on(StoreClusterActions.refreshStoreClustersSuccess, (state, { payload }) =>
        adapter.addAll(payload.data, {
            ...state,
            isLoadingRow: false,
            deepestLevel: payload.deepestLevel
        })
    ),
    on(StoreClusterActions.clearState, state =>
        adapter.removeAll({
            ...state,
            isLoading: false,
            isRefresh: undefined,
            selectedId: null,
            deepestLevel: 0
        })
    )
);
