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
    total: number;
    textSearch: string;
}

// Adapter for Association state
const adapter = createEntityAdapter<Association>({ selectId: row => row.id });

// Initialize state
const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    selectedId: null,
    textSearch: null,
    total: 0
});

// Reducer manage the action
const reducer = createReducer<State>(
    initialState,
    on(AssociationActions.fetchAssociationRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(AssociationActions.fetchAssociationFailure, state => ({
        ...state,
        isLoading: false
    })),
    on(AssociationActions.fetchAssociationSuccess, (state, { payload }) => {
        return adapter.addAll(payload.data, {
            ...state,
            isLoading: false,
            total: payload.total
        });
    }),
    on(AssociationActions.setSearchValue, (state, { payload }) => ({
        ...state,
        textSearch: payload
    }))
);

// Set anything for the export
export { adapter, featureKey, initialState, reducer, State };
