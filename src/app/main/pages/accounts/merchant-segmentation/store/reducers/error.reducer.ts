import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';

import {
    StoreChannelActions,
    StoreClusterActions,
    StoreGroupActions,
    StoreTypeActions
} from '../actions';

// Keyname for reducer
export const featureKey = 'errors';

/**
 *
 * Main interface for reducer
 * @export
 * @interface State
 * @extends {EntityState<ErrorHandler>}
 */
export interface State extends EntityState<ErrorHandler> {
    selectedId: string;
}

// Adapter for errors state
export const adapter = createEntityAdapter<ErrorHandler>({ selectId: row => row.id });

// Initialize state
export const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    selectedId: null
});

// Reducer manage the action
export const reducer = createReducer(
    initialState,
    on(
        StoreChannelActions.createStoreChannelFailure,
        StoreChannelActions.fetchStoreChannelsFailure,
        StoreChannelActions.fetchStoreLastChannelFailure,
        StoreChannelActions.refreshStoreChannelsFailure,
        StoreClusterActions.createStoreClusterFailure,
        StoreClusterActions.fetchStoreClustersFailure,
        StoreClusterActions.fetchStoreLastClusterFailure,
        StoreClusterActions.refreshStoreClustersFailure,
        (state, { payload }) => adapter.upsertOne(payload, state)
    ),
    on(
        StoreGroupActions.createStoreGroupFailure,
        StoreGroupActions.fetchStoreGroupsFailure,
        StoreGroupActions.fetchStoreLastGroupFailure,
        StoreGroupActions.refreshStoreGroupsFailure,
        StoreTypeActions.createStoreTypeFailure,
        StoreTypeActions.fetchStoreTypesFailure,
        StoreTypeActions.fetchStoreLastTypeFailure,
        StoreTypeActions.refreshStoreTypesFailure,
        (state, { payload }) => adapter.upsertOne(payload, state)
    ),
    on(StoreChannelActions.createStoreChannelSuccess, state =>
        adapter.removeOne('createStoreChannelFailure', state)
    ),
    on(StoreChannelActions.fetchStoreChannelsSuccess, state =>
        adapter.removeOne('fetchStoreChannelsFailure', state)
    ),
    on(StoreChannelActions.fetchStoreLastChannelSuccess, state =>
        adapter.removeOne('fetchStoreLastChannelFailure', state)
    ),
    on(StoreChannelActions.refreshStoreChannelsSuccess, state =>
        adapter.removeOne('refreshStoreChannelsFailure', state)
    ),
    on(StoreClusterActions.createStoreClusterSuccess, state =>
        adapter.removeOne('createStoreClusterFailure', state)
    ),
    on(StoreClusterActions.fetchStoreClustersSuccess, state =>
        adapter.removeOne('fetchStoreClustersFailure', state)
    ),
    on(StoreClusterActions.fetchStoreLastClusterSuccess, state =>
        adapter.removeOne('fetchStoreLastClusterFailure', state)
    ),
    on(StoreClusterActions.refreshStoreClustersSuccess, state =>
        adapter.removeOne('refreshStoreClustersFailure', state)
    ),
    on(StoreGroupActions.createStoreGroupSuccess, state =>
        adapter.removeOne('createStoreGroupFailure', state)
    ),
    on(StoreGroupActions.fetchStoreGroupsSuccess, state =>
        adapter.removeOne('fetchStoreGroupsFailure', state)
    ),
    on(StoreGroupActions.fetchStoreLastGroupSuccess, state =>
        adapter.removeOne('fetchStoreLastGroupFailure', state)
    ),
    on(StoreGroupActions.refreshStoreGroupsSuccess, state =>
        adapter.removeOne('refreshStoreGroupsFailure', state)
    ),
    on(StoreTypeActions.createStoreTypeSuccess, state =>
        adapter.removeOne('createStoreTypeFailure', state)
    ),
    on(StoreTypeActions.fetchStoreTypesSuccess, state =>
        adapter.removeOne('fetchStoreTypesFailure', state)
    ),
    on(StoreTypeActions.fetchStoreLastTypeSuccess, state =>
        adapter.removeOne('fetchStoreLastTypeFailure', state)
    ),
    on(StoreTypeActions.refreshStoreTypesSuccess, state =>
        adapter.removeOne('refreshStoreTypesFailure', state)
    ),
    on(
        StoreChannelActions.clearState,
        StoreClusterActions.clearState,
        StoreGroupActions.clearState,
        StoreTypeActions.clearState,
        state => adapter.removeAll({ ...state })
    )
);
