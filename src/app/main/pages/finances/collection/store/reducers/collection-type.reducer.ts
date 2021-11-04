import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { CalculateCollectionStatusPayment } from '../../models';
import { CollectionActions } from '../actions';

// Keyname for reducer
export const featureKey = 'collectionTypes';

export interface State extends EntityState<CalculateCollectionStatusPayment> {
    isLoading: boolean;
    isRefresh: boolean;
    selectedId: string;
    total: number;
    calculateData: CalculateCollectionStatusPayment[];
}

// Adapter for collectionTypes state
export const adapter = createEntityAdapter<CalculateCollectionStatusPayment>({
    selectId: (row) => row.id,
});

// Initialize state
export const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    isRefresh: undefined,
    selectedId: null,
    total: 0,
    calculateData: []
});

// Create the reducer.
export const reducer = createReducer(
    initialState,
    on(
        CollectionActions.fetchCalculateCollectionStatusRequest,
        (state) => ({
            ...state,
            isLoading: true,
        })
    ),
    on(
        CollectionActions.fetchCalculateCollectionStatusFailure,
        (state) => ({
            ...state,
            isLoading: false,
        })
    ),
    on(CollectionActions.fetchCalculateCollectionStatusSuccess, (state, { payload }) =>
        adapter.addAll(payload.data, { ...state, isLoading: false, calculateData: payload.data})
    ),
    on(CollectionActions.setRefreshStatus, (state, { payload }) => ({
        ...state,
        needRefresh: payload,
    })),
    on(CollectionActions.clearState, () => initialState)
);
