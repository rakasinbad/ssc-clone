import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Portfolio } from 'app/shared/models/portfolio.model';
import { PortfolioActions } from 'app/shared/store/actions';

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

// Adapter for teams state
const adapter = createEntityAdapter<Portfolio>({ selectId: row => row.id });

// Initialize state
const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    selectedId: null,
    total: 0
});

// Reducer manage the action
const reducer = createReducer<State>(
    initialState,
    on(PortfolioActions.fetchPortfolioRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(PortfolioActions.fetchPortfolioFailure, state => ({
        ...state,
        isLoading: false
    })),
    on(PortfolioActions.fetchPortfolioSuccess, (state, { payload }) => {
        return adapter.addAll(payload.data, {
            ...state,
            isLoading: false,
            selectedId: null,
            total: payload.total
        });
    }),
    on(PortfolioActions.clearPortfolioState, state => {
        return adapter.removeAll({ ...state, isLoading: false, selectedId: null, total: 0 });
    })
);

// Set anything for the export
export { adapter, featureKey, initialState, reducer, State };
