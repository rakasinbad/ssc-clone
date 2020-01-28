import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { AssociationStore } from '../../models';
import { AssociationStoresActions } from '../actions';

// Keyname for reducer
const featureKey = 'associationStores';

/**
 *
 * Main interface for reducer
 * @interface State
 * @extends {EntityState<AssociationStore>}
 */
interface State extends EntityState<AssociationStore> {
    isRefresh?: boolean;
    isLoading: boolean;
    selectedId: string;
    total: number;
}

// Adapter for AssociationStore state
const adapter = createEntityAdapter<AssociationStore>({ selectId: row => row.id });

// Initialize state
const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    selectedId: null,
    total: 0
});

// Reducer manage the action
const reducer = createReducer<State>(
    initialState,
    on(AssociationStoresActions.fetchAssociationStoresRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(AssociationStoresActions.fetchAssociationStoresFailure, state => ({
        ...state,
        isLoading: false
    })),
    on(AssociationStoresActions.fetchAssociationStoresSuccess, (state, { payload }) => {
        return adapter.addAll(payload.data, {
            ...state,
            isLoading: false,
            total: payload.total
        });
    })
);

// Set anything for the export
export { adapter, featureKey, initialState, reducer, State };
