// Import things.
import { createReducer, on } from '@ngrx/store';
import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { ErrorHandler } from 'app/shared/models';
import { PortfolioActions } from '../actions';

// The reducer's feature key.
export const featureKey = 'errors';

/**
 * Main interface state for the reducer.
 */
export interface State extends EntityState<ErrorHandler> {
    selectedId: string | null;
}

// Adapter for the state.
export const adapter = createEntityAdapter<ErrorHandler>({ selectId: row => row.id });

// Initial reducer's state.
export const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    selectedId: null
});

// Create the reducer.
export const reducer = createReducer(
    initialState,
    on(
        PortfolioActions.fetchPortfolioFailure,
        PortfolioActions.fetchPortfoliosFailure,
        (state, { payload }) => adapter.upsertOne(payload, state)
    )
);
