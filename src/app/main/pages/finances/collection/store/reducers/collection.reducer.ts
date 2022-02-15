import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { CollectionStatus, FinanceDetailCollection } from '../../models';
import { CollectionActions, RejectReasonActions } from '../actions';

// Keyname for reducer
export const featureKey = 'collectionStatus';

export interface State extends EntityState<CollectionStatus> {
    isLoading: boolean;
    isRefresh: boolean;
    selectedId: string;
    total: number;
}

// Adapter for CollectionStatus state
export const adapter = createEntityAdapter<CollectionStatus>({
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
        CollectionActions.fetchCollectionStatusRequest,
        CollectionActions.updateCollectionStatusRequest,
        (state) => ({
            ...state,
            isLoading: true,
        })
    ),
    on(RejectReasonActions.updateColPaymentApprovalRequest, (state) => ({
        ...state,
        isLoading: false,
    })),
    on(RejectReasonActions.updateColPaymentRejectRequest, (state) => ({
        ...state,
        isLoading: false,
    })),
    on(
        CollectionActions.fetchCollectionStatusFailure,
        CollectionActions.updateCollectionStatusFailure,
        (state) => ({
            ...state,
            isLoading: false,
        })
    ),
    on(RejectReasonActions.updateColPaymentApprovalFailure, (state) => ({
        ...state,
        isLoading: false,
    })),
    on(RejectReasonActions.updateColPaymentRejectFailure, (state) => ({
        ...state,
        isLoading: false,
    })),
    on(CollectionActions.fetchCollectionStatusSuccess, (state, { payload }) =>
        adapter.addAll(payload.data, { ...state, isLoading: false, total: payload.total })
    ),
    on(CollectionActions.setRefreshStatus, (state, { payload }) => ({
        ...state,
        needRefresh: payload,
    })),
    on(RejectReasonActions.updateColPaymentApprovalSuccess, (state, { payload }) =>
    adapter.updateOne(payload, { ...state, isLoading: false })
    ),
    on(RejectReasonActions.updateColPaymentApprovalSuccess, (state, { payload }) =>
        adapter.updateOne(payload, { ...state, isLoading: false })
    ),
    on(CollectionActions.clearState, () => initialState)
);
