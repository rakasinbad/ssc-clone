import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { AssociationPortfolio } from '../../models';
import { AssociationActions } from '../actions';

// Keyname for reducer
const featureKey = 'associations';

/**
 *
 * Main interface for reducer
 * @interface State
 * @extends {EntityState<AssociationPortfolio>}
 */
interface State extends EntityState<AssociationPortfolio> {
    isRefresh?: boolean;
    isLoading: boolean;
    selectedId: string;
    total: number;
}

// Adapter for AssociationPortfolio state
const adapter = createEntityAdapter<AssociationPortfolio>({ selectId: row => row.id });

// Initialize state
const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    selectedId: null,
    total: 0
});

// Reducer manage the action
const reducer = createReducer<State>(
    initialState,
    on(AssociationActions.fetchAssociationPortfoliosRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(AssociationActions.fetchAssociationPortfoliosFailure, state => ({
        ...state,
        isLoading: false
    })),
    on(AssociationActions.fetchAssociationPortfoliosSuccess, (state, { payload }) => {
        return adapter.addAll(payload.data, {
            ...state,
            isLoading: false,
            total: payload.total
        });
    })
);

// Set anything for the export
export { adapter, featureKey, initialState, reducer, State };
