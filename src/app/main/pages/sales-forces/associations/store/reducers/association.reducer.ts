import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { Association } from '../../models';
import { AssociationActions } from '../actions';

// Keyname for reducer
const featureKey = 'associations';

/**
 *
 * Main interface for reducer
 * @interface State
 * @extends {EntityState<Association>}
 */
interface State extends EntityState<Association> {
    isRefresh?: boolean;
    isLoading: boolean;
    selectedId: string;
    type: string;
    total: number;
    textSearch: string;
}

// Adapter for Association state
const adapter = createEntityAdapter<Association>({ selectId: row => row.id });

// Initialize state
const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    selectedId: null,
    type: 'all',
    textSearch: null,
    total: 0
});

// Reducer manage the action
const reducer = createReducer<State>(
    initialState,
    on(
        AssociationActions.fetchAssociationRequest,
        AssociationActions.fetchAssociationsRequest,
        state => ({
            ...state,
            isLoading: true
        })
    ),
    on(
        AssociationActions.fetchAssociationFailure,
        AssociationActions.fetchAssociationsFailure,
        state => ({
            ...state,
            isLoading: false
        })
    ),
    on(AssociationActions.fetchAssociationSuccess, (state, { payload }) => {
        return adapter.addAll(payload.data, {
            ...state,
            isLoading: false,
            total: payload.total
        });
    }),
    on(AssociationActions.setPortfolioEntityType, (state, { payload }) => ({
        ...state,
        type: payload
    })),
    on(AssociationActions.setSearchValue, (state, { payload }) => ({
        ...state,
        textSearch: payload
    }))
);

// Set anything for the export
export { adapter, featureKey, initialState, reducer, State };
