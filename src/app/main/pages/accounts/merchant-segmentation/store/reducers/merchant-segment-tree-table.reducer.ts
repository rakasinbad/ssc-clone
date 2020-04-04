import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { StoreSegmentTree } from '../../models';
import {
    StoreChannelActions,
    StoreClusterActions,
    StoreGroupActions,
    StoreTypeActions
} from '../actions';

// Keyname for reducer
export const featureKey = 'storeSegmentTreeTable';

export interface State extends EntityState<StoreSegmentTree> {
    isLoading: boolean;
    isRefresh: boolean;
    selectedId: string;
    total: number;
}

// Adapter for storeSegmentTreeTable state
export const adapter = createEntityAdapter<StoreSegmentTree>({ selectId: row => row.id });

// Initialize state
export const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    isRefresh: undefined,
    selectedId: null,
    total: 0
});

// Reducer manage the action
export const reducer = createReducer<State>(
    initialState,
    on(StoreTypeActions.cancelConfirmChangeStatusStoreType, state => ({
        ...state,
        isLoading: true,
        isRefresh: true
    })),
    on(
        StoreChannelActions.fetchStoreLastChannelRequest,
        StoreClusterActions.fetchStoreLastClusterRequest,
        StoreGroupActions.fetchStoreLastGroupRequest,
        StoreTypeActions.fetchStoreLastTypeRequest,
        state => ({ ...state, isLoading: true, isRefresh: undefined })
    ),
    on(
        StoreChannelActions.fetchStoreLastChannelFailure,
        StoreClusterActions.fetchStoreLastClusterFailure,
        StoreGroupActions.fetchStoreLastGroupFailure,
        StoreTypeActions.fetchStoreLastTypeFailure,
        state => ({ ...state, isLoading: false })
    ),
    on(
        StoreChannelActions.createStoreChannelFailure,
        StoreChannelActions.createStoreChannelSuccess,
        StoreChannelActions.updateStoreChannelFailure,
        StoreChannelActions.updateStoreChannelSuccess,
        StoreClusterActions.createStoreClusterFailure,
        StoreClusterActions.createStoreClusterSuccess,
        StoreClusterActions.updateStoreClusterFailure,
        StoreClusterActions.updateStoreClusterSuccess,
        StoreGroupActions.createStoreGroupFailure,
        StoreGroupActions.createStoreGroupSuccess,
        StoreGroupActions.updateStoreGroupFailure,
        StoreGroupActions.updateStoreGroupSuccess,
        StoreTypeActions.createStoreTypeFailure,
        StoreTypeActions.createStoreTypeSuccess,
        StoreTypeActions.updateStoreTypeFailure,
        StoreTypeActions.updateStoreTypeSuccess,
        state => ({ ...state, isRefresh: true })
    ),
    on(
        StoreChannelActions.fetchStoreLastChannelSuccess,
        StoreClusterActions.fetchStoreLastClusterSuccess,
        StoreGroupActions.fetchStoreLastGroupSuccess,
        StoreTypeActions.fetchStoreLastTypeSuccess,
        (state, { payload }) =>
            adapter.addAll(payload.data, {
                ...state,
                isLoading: false,
                total: payload.total
            })
    ),
    on(
        StoreChannelActions.clearTableState,
        StoreClusterActions.clearTableState,
        StoreGroupActions.clearTableState,
        StoreTypeActions.clearTableState,
        state =>
            adapter.removeAll({
                ...state,
                isLoading: false,
                isRefresh: undefined,
                selectedId: null,
                total: 0
            })
    )
);
