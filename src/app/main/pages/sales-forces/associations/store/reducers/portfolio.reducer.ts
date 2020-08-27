import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { PortfolioActions } from '../actions';
import { Portfolio } from '../../models';

// Keyname for reducer
const featureKey = 'portfolios';

/**
 *
 * Main interface for reducer
 * @interface State
 * @extends {EntityState<Portfolio>}
 */
interface State extends EntityState<Portfolio> {
    isRefresh?: boolean;
    isLoading: boolean;
    selectedId: string;
    total: number;
}

// Adapter for Portfolio state
const adapter = createEntityAdapter<Portfolio>({ selectId: row => row.id });

// Initialize state
const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    isRefresh: false,
    selectedId: null,
    total: 0
});

// Reducer manage the action
const reducer = createReducer<State>(
    initialState,
    on(
        PortfolioActions.fetchPortfoliosRequest,
        state => ({
            ...state,
            isLoading: true,
            isRefresh: true,
        })
    ),
    on(
        PortfolioActions.fetchPortfoliosFailure,
        state => ({
            ...state,
            isLoading: false,
            isRefresh: true,
        })
    ),
    on(PortfolioActions.fetchPortfoliosSuccess, (state, { payload }) =>
        adapter.addAll(payload.data, {
            ...state,
            isLoading: false,
            isRefresh: true,
            total: payload.total
        })
    ),
    on(PortfolioActions.clearState, state =>
        adapter.removeAll({
            ...state,
            isLoading: false,
            isRefresh: false,
            selectedId: null,
            total: 0
        })
    )
);

// Set anything for the export
export { adapter, featureKey, initialState, reducer, State };
