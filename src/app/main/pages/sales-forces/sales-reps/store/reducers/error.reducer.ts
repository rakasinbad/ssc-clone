import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';

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
    on(
        SalesRepActions.createSalesRepFailure,
        SalesRepActions.updateSalesRepFailure,
        SalesRepActions.changePasswordSalesRepFailure,
        SalesRepActions.changeStatusSalesRepFailure,
        SalesRepActions.batchSetActiveSalesRepsFailure,
        SalesRepActions.batchSetInactiveSalesRepsFailure,
        SalesRepActions.batchDeleteSalesRepsFailure,
        SalesRepActions.fetchSalesRepsFailure,
        SalesRepActions.fetchSalesRepFailure,
        (state, { payload }) => {
            return adapter.upsertOne(payload, state);
        }
    ),
    on(SalesRepActions.fetchSalesRepsSuccess, state => {
        return adapter.removeOne('fetchSalesRepsFailure', state);
    }),
    on(SalesRepActions.fetchSalesRepSuccess, state => {
        return adapter.removeOne('fetchSalesRepFailure', state);
    }),
    on(SalesRepActions.createSalesRepSuccess, state => {
        return adapter.removeOne('createSalesRepFailure', state);
    }),
    on(SalesRepActions.updateSalesRepSuccess, state => {
        return adapter.removeOne('updateSalesRepFailure', state);
    }),
    on(SalesRepActions.changePasswordSalesRepSuccess, state => {
        return adapter.removeOne('changePasswordSalesRepFailure', state);
    }),
    on(SalesRepActions.changeStatusSalesRepSuccess, state => {
        return adapter.removeOne('changeStatusSalesRepFailure', state);
    }),
    on(SalesRepActions.batchSetActiveSalesRepsSuccess, state => {
        return adapter.removeOne('batchSetActiveSalesRepsFailure', state);
    }),
    on(SalesRepActions.batchSetInactiveSalesRepsSuccess, state => {
        return adapter.removeOne('batchSetInactiveSalesRepsFailure', state);
    }),
    on(SalesRepActions.batchDeleteSalesRepsSuccess, state => {
        return adapter.removeOne('batchDeleteSalesRepsFailure', state);
    }),
    on(SalesRepActions.clearState, state => {
        return adapter.removeAll({ ...state });
    })
);

// Set anything for the export
export { featureKey, initialState, reducer, State };
