import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';

import { StoreGroupActions, StoreTypeActions } from '../actions';

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
        StoreGroupActions.createStoreGroupFailure,
        StoreGroupActions.fetchStoreGroupsFailure,
        StoreGroupActions.refreshStoreGroupsFailure,
        StoreTypeActions.createStoreTypeFailure,
        StoreTypeActions.fetchStoreTypesFailure,
        StoreTypeActions.refreshStoreTypesFailure,
        (state, { payload }) => {
            return adapter.upsertOne(payload, state);
        }
    ),
    on(StoreGroupActions.createStoreGroupSuccess, state =>
        adapter.removeOne('createStoreGroupFailure', state)
    ),
    on(StoreGroupActions.fetchStoreGroupsSuccess, state =>
        adapter.removeOne('fetchStoreGroupsFailure', state)
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
    on(StoreTypeActions.refreshStoreTypesSuccess, state =>
        adapter.removeOne('refreshStoreTypesFailure', state)
    ),
    on(StoreGroupActions.clearState, StoreTypeActions.clearState, state =>
        adapter.removeAll({ ...state })
    )
);
