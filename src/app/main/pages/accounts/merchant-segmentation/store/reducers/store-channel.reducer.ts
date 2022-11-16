import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { StoreChannel } from '../../models';
import { StoreChannelActions } from '../actions';

// Keyname for reducer
export const featureKey = 'storeChannels';

export interface State extends EntityState<StoreChannel> {
    isError: boolean;
    isLoading: boolean;
    isLoadingRow: boolean;
    isRefresh: boolean;
    selectedId: string;
    deepestLevel: number;
    deactiveItem: boolean;
}

// Adapter for storeChannels state
export const adapter = createEntityAdapter<StoreChannel>({ selectId: row => row.id });

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
    on(StoreChannelActions.cancelConfirmChangeStatusStoreChannel, state => ({
        ...state,
        isLoadingRow: true,
        isRefresh: true
    })),
    on(
        StoreChannelActions.createStoreChannelRequest,
        StoreChannelActions.updateStoreChannelRequest,
        state => ({ ...state, isError: false, isLoadingRow: true, deactiveItem: false, selectedId: null })
    ),
    on(
        StoreChannelActions.createStoreChannelFailure,
        StoreChannelActions.updateStoreChannelFailure,
        state => ({ ...state, isError: true, isRefresh: true })
    ),
    on(StoreChannelActions.refreshStoreChannelsRequest, state => ({
        ...state,
        isRefresh: false
    })),
    on(StoreChannelActions.refreshStoreChannelsFailure, state => ({
        ...state,
        isLoadingRow: false
    })),
    on(StoreChannelActions.fetchStoreChannelsRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(StoreChannelActions.fetchStoreChannelsFailure, state => ({
        ...state,
        isLoading: false
    })),
    on(
        StoreChannelActions.createStoreChannelSuccess,
        state => ({ ...state, isRefresh: true })
    ),
    on(
        StoreChannelActions.updateStoreChannelSuccess,
        (state, { payload }) => ({ ...state, isRefresh: true, deactiveItem: payload.deactive, selectedId: payload.id })
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
            isError: false,
            isLoading: false,
            isRefresh: undefined,
            selectedId: null,
            deepestLevel: 0,
            deactiveItem: false,
        })
    )
);
