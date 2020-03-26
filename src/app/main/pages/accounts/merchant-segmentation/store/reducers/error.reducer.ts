import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';

import { StoreTypeActions } from '../actions';

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
        StoreTypeActions.createStoreTypeFailure,
        StoreTypeActions.fetchStoreTypesFailure,
        (state, { payload }) => {
            return adapter.upsertOne(payload, state);
        }
    ),
    on(StoreTypeActions.createStoreTypeSuccess, state => {
        return adapter.removeOne('createStoreTypeFailure', state);
    }),
    on(StoreTypeActions.fetchStoreTypesSuccess, state => {
        return adapter.removeOne('fetchStoreTypesFailure', state);
    }),
    on(StoreTypeActions.clearState, state => {
        return adapter.removeAll({ ...state });
    })
);
