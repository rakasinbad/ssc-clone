import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models';

import { SalesRepActions } from '../actions';

// Keyname for reducer
const featureKey = 'errors';

/**
 *
 * Main interface for reducer
 * @interface State
 * @extends {EntityState<ErrorHandler>}
 */
interface State extends EntityState<ErrorHandler> {
    selectedId: string;
}

// Adapter for errors state
const adapter = createEntityAdapter<ErrorHandler>({ selectId: row => row.id });

// Initialize state
const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    selectedId: null
});

// Reducer manage the action
const reducer = createReducer<State>(
    initialState,
    on(SalesRepActions.fetchSalesRepsFailure, (state, { payload }) => {
        return adapter.upsertOne(payload, state);
    }),
    on(SalesRepActions.fetchSalesRepsSuccess, state => {
        return adapter.removeOne('fetchSalesRepsFailure', state);
    })
);

// Set anything for the export
export { featureKey, initialState, reducer, State };
