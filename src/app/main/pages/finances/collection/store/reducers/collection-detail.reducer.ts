import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { FinanceDetailCollection } from '../../models';
import { CollectionActions } from '../actions';

// Keyname for reducer
export const featureKey = 'collectionDetailStatus';

export interface State extends EntityState<FinanceDetailCollection> {
    isLoading: boolean;
    isRefresh: boolean;
    selectedId: string;
    total: number;
}

// Adapter for Detail state
export const adapter = createEntityAdapter<FinanceDetailCollection>({
    selectId: (row) => row.id,
});

// Initialize state
export const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    isRefresh: undefined,
    selectedId: null,
    total: 0,
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
    on(CollectionActions.fetchCollectionDetailRequest, (state, { payload }) => ({
        ...state,
        isLoading: true,
        selectedId: payload.id,
    })),
    on(CollectionActions.fetchCollectionDetailSuccess, (state, { payload }) =>
        adapter.addOne(payload, { ...state, isLoading: false })
    ),
    on(CollectionActions.setRefreshStatus, (state, { payload }) => ({
        ...state,
        needRefresh: payload,
    })),
    on(CollectionActions.clearState, () => initialState)
);
