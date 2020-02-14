import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models';

import { WarehouseCoverageActions } from '../actions';

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
    on(WarehouseCoverageActions.fetchWarehouseCoveragesFailure, (state, { payload }) => {
        return adapter.upsertOne(payload, state);
    }),
    on(WarehouseCoverageActions.fetchWarehouseCoveragesSuccess, state => {
        return adapter.removeOne('fetchWarehouseCoveragesFailure', state);
    })
);
