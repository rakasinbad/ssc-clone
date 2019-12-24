import { createReducer, on } from '@ngrx/store';
import { EntityState, createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { Portfolio } from '../../models/portfolios.model';
import { PortfolioActions } from '../actions';

// Set reducer's feature key
export const featureKey = 'portfolios';

/**
 * Interface's state.
 */
export interface State extends EntityState<Portfolio> {
    isLoading: boolean;
    needRefresh: boolean;
    selectedIds: Array<string>;
    total: number;
}

// Entity Adapter for the Entity State.
export const adapter: EntityAdapter<Portfolio> = createEntityAdapter<Portfolio>({
    selectId: portfolio => portfolio.id,
});

// Set the reducer's initial state.
export const initialState = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    needRefresh: false,
    selectedIds: [],
    total: 0,
});

// Create the reducer.
export const reducer = createReducer(
    initialState,
    on(
        PortfolioActions.fetchPortfolioRequest,
        PortfolioActions.fetchPortfoliosRequest,
        state => ({
            ...state,
            isLoading: false
        })
    ),
    on(
        PortfolioActions.fetchPortfolioSuccess,
        (state, { payload }) => adapter.upsertOne(payload.portfolio, state)
    ),
    on(
        PortfolioActions.fetchPortfoliosSuccess,
        (state, { payload }) => ({
            ...state,
            state: adapter.addAll(payload.portfolios, state),
            total: payload.total
        })
    ),
    on(
        PortfolioActions.truncatePortfolios,
        state => adapter.removeAll(state)
    )
);
