import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { SalesRep } from '../../models';
import { SalesRepActions } from '../actions';

// Keyname for reducer
const featureKey = 'salesReps';

/**
 *
 * Main interface for reducer
 * @interface State
 * @extends {EntityState<SalesRep>}
 */
interface State extends EntityState<SalesRep> {
    isRefresh?: boolean;
    isLoading: boolean;
    selectedId: string;
    total: number;
}

// Adapter for salesReps state
const adapter = createEntityAdapter<SalesRep>({ selectId: row => row.id });

// Initialize state
const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    selectedId: null,
    total: 0
});

// Reducer manage the action
const reducer = createReducer<State>(
    initialState,
    on(
        SalesRepActions.fetchSalesRepsRequest,
        state => ({
            ...state,
            isLoading: true
        })
    ),
    on(
        SalesRepActions.fetchSalesRepsFailure,
        state => ({
            ...state,
            isLoading: false
        })
    ),
    on(SalesRepActions.fetchSalesRepsSuccess, (state, { payload }) => {
        return adapter.upsertMany(payload.data, {
            ...state,
            isLoading: false,
            total: payload.total
        });
    }),
    on(SalesRepActions.clearState, state => {
        return adapter.removeAll({ ...state, isLoading: false, selectedId: null, total: 0 });
    })
);

// Set anything for the export
export { adapter, featureKey, initialState, reducer, State };
