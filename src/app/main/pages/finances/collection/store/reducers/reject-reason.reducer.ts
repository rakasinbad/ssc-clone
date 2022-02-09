import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { IErrorHandler } from 'app/shared/models/global.model';

import { RejectReason } from '../../models';
import { RejectReasonActions } from '../actions';

// Keyname for reducer
export const featureKey = 'collectionRejectReason';

export interface State extends EntityState<RejectReason> {
    isLoading: boolean;
    reason: string;
}

// Adapter for CollectionStatus state
export const adapter = createEntityAdapter<RejectReason>({
    selectId: (row) => row.id,
});

// Initialize state
export const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    reason: ''
});

// Create the reducer.
export const reducer = createReducer(
    initialState,
    on(RejectReasonActions.fetchRejectReasonRequest, (state, { payload }) => ({
        ...state,
        isLoading: true,
        type: payload.type,
    })),
    on(RejectReasonActions.fetchRejectReasonFailure, (state) => ({
        ...state,
        isLoading: false,
    })),
    on(RejectReasonActions.fetchRejectReasonSuccess, (state, { payload }) =>
        adapter.addAll(payload.data, { ...state, isLoading: false, total: payload.data.length })

    ),
    on(RejectReasonActions.clearState, RejectReasonActions.clearRejectReason, () => initialState)
);