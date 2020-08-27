import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { StorePortfolio } from '../../models';
import { StorePortfolioActions } from '../actions';

// Keyname for reducer
const featureKey = 'storePortfolios';

/**
 *
 * Main interface for reducer
 * @interface State
 * @extends {EntityState<StorePortfolio>}
 */
interface State extends EntityState<StorePortfolio> {
    isRefresh?: boolean;
    isLoading: boolean;
    selectedId: string;
    total: number;
}

// Adapter for StorePortfolios state
const adapter = createEntityAdapter<StorePortfolio>({ selectId: row => row.id });

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
    on(StorePortfolioActions.fetchStorePortfoliosRequest, state => ({
        ...state,
        isLoading: true,
    })),
    on(StorePortfolioActions.fetchStorePortfoliosFailure, state => ({
        ...state,
        isLoading: false
    })),
    on(StorePortfolioActions.fetchStorePortfoliosSuccess, (state, { payload }) =>
        adapter.upsertMany(payload.data, {
            ...state,
            isLoading: false,
            isRefresh: true,
            total: payload.total
        })
    ),
    on(StorePortfolioActions.clearState, state =>
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
