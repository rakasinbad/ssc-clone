import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { AssociationActions } from '../actions';
import { Association } from '../../models';

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
    total: number;
}

// Adapter for Association state
const adapter = createEntityAdapter<Association>({ selectId: row => row.id });

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
        AssociationActions.fetchAssociationsRequest,
        AssociationActions.createAssociationRequest,
        state => ({
            ...state,
            isLoading: true,
            isRefresh: true,
        })
    ),
    on(
        AssociationActions.fetchAssociationsFailure,
        AssociationActions.createAssociationFailure,
        AssociationActions.createAssociationSuccess,
        state => ({
            ...state,
            isLoading: false,
            isRefresh: true,
        })
    ),
    on(AssociationActions.fetchAssociationsSuccess, (state, { payload }) =>
        adapter.addAll(payload.data, {
            ...state,
            isLoading: false,
            isRefresh: true,
            total: payload.total
        })
    ),
    on(AssociationActions.clearState, state =>
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
