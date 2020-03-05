import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { Portfolio } from '../../../portfolios/models';
import { AssociatedPortfolioActions } from '../actions';

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
    initialized: boolean;
    selectedIds: Array<string>;
    total: number;
}

// Adapter for Portfolio state
const adapter = createEntityAdapter<Portfolio>({ selectId: row => row.id });

// Initialize state
const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    initialized: false,
    selectedIds: [],
    total: 0
});

// Reducer manage the action
const reducer = createReducer<State>(
    initialState,
    on(AssociatedPortfolioActions.fetchAssociatedPortfoliosRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(AssociatedPortfolioActions.fetchAssociatedPortfoliosFailure, state => ({
        ...state,
        isLoading: false
    })),
    on(AssociatedPortfolioActions.markInitialized, state => ({
        ...state,
        initialized: true
    })),
    on(AssociatedPortfolioActions.abortInitialized, state => ({
        ...state,
        initialized: false
    })),
    on(AssociatedPortfolioActions.fetchAssociatedPortfoliosSuccess, (state, { payload }) => {
        return adapter.upsertMany(payload.data, {
            ...state,
            isLoading: false,
            total: payload.total
        });
    }),
    on(AssociatedPortfolioActions.addSelectedPortfolios, (state, { payload }) => {
        return adapter.upsertMany(payload, {
            ...state
        });
    }),
    on(AssociatedPortfolioActions.removeSelectedPortfolios, (state, { payload }) => {
        return adapter.removeMany(payload, {
            ...state
        });
    }),
    on(AssociatedPortfolioActions.removeSelectedPortfolios, (state, { payload }) => {
        return adapter.removeMany(payload, {
            ...state
        });
    }),
    on(AssociatedPortfolioActions.markPortfolioAsRemoved, (state, { payload }) => {
        return adapter.upsertMany(
            payload.map(
                id =>
                    new Portfolio({
                        ...state.entities[id],
                        isSelected: false,
                        deletedAt: new Date().toISOString()
                    })
            ),
            {
                ...state
            }
        );
    }),
    on(AssociatedPortfolioActions.abortPortfolioAsRemoved, (state, { payload }) => {
        return adapter.upsertMany(
            payload.map(
                id => new Portfolio({ ...state.entities[id], isSelected: true, deletedAt: null })
            ),
            {
                ...state
            }
        );
    }),
    on(AssociatedPortfolioActions.clearAssociatedPortfolios, state => adapter.removeAll(state))
);

// Set anything for the export
export { adapter, featureKey, initialState, reducer, State };
