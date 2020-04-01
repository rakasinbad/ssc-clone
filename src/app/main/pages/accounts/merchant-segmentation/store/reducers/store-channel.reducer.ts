import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { StoreChannel } from '../../models';
import { StoreChannelActions } from '../actions';

// Keyname for reducer
export const featureKey = 'storeChannels';

export interface State extends EntityState<StoreChannel> {
    isLoading: boolean;
    isLoadingRow: boolean;
    isRefresh: boolean;
    selectedId: string;
    deepestLevel: number;
}

// Adapter for storeChannels state
export const adapter = createEntityAdapter<StoreChannel>({ selectId: row => row.id });

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
        StoreChannelActions.createStoreChannelRequest,
        StoreChannelActions.updateStoreChannelRequest,
        state => ({ ...state, isLoadingRow: true })
    ),
    on(
        StoreChannelActions.createStoreChannelFailure,
        StoreChannelActions.updateStoreChannelFailure,
        state => ({ ...state, isRefresh: true })
    ),
    on(StoreChannelActions.refreshStoreChannelsRequest, state => ({ ...state, isRefresh: false })),
    on(StoreChannelActions.refreshStoreChannelsFailure, state => ({
        ...state,
        isLoadingRow: false
    })),
    on(StoreChannelActions.fetchStoreChannelsRequest, state => ({ ...state, isLoading: true })),
    on(StoreChannelActions.fetchStoreChannelsFailure, state => ({ ...state, isLoading: false })),
    on(
        StoreChannelActions.createStoreChannelSuccess,
        StoreChannelActions.updateStoreChannelSuccess,
        state => ({ ...state, isRefresh: true })
    ),
    on(StoreChannelActions.fetchStoreChannelsSuccess, (state, { payload }) =>
        adapter.addAll(payload.data, {
            ...state,
            isLoading: false,
            deepestLevel: payload.deepestLevel
        })
    ),
    on(StoreChannelActions.refreshStoreChannelsSuccess, (state, { payload }) =>
        adapter.addAll(payload.data, {
            ...state,
            isLoadingRow: false,
            deepestLevel: payload.deepestLevel
        })
    ),
    on(StoreChannelActions.clearState, state =>
        adapter.removeAll({
            ...state,
            isLoading: false,
            isRefresh: undefined,
            selectedId: null,
            deepestLevel: 0
        })
    )
);
