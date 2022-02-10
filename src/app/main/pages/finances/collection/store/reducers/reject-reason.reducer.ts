import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { IErrorHandler } from 'app/shared/models/global.model';

import { RejectReason, ColPaymentApproval } from '../../models';
import { RejectReasonActions } from '../actions';

// Keyname for reducer
export const featureKey = 'collectionRejectReason';

export interface State extends EntityState<ColPaymentApproval> {
    isLoading: boolean;
    reason: string;
    billingCode: string;
    billingRef: string;
    updatedAt: string;
    approvalStatus: string;
}

// Adapter for CollectionStatus state
export const adapter = createEntityAdapter<ColPaymentApproval>({
    selectId: (row) => row.id,
});

// Initialize state
export const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    reason: '',
    billingCode: '',
    billingRef: '',
    updatedAt: '',
    approvalStatus: ''
});

// Create the reducer.
export const reducer = createReducer(
    initialState,
    on(RejectReasonActions.fetchRejectReasonRequest, (state, { payload }) => ({
        ...state,
        isLoading: true,
        type: payload.type,
    })),
    on(RejectReasonActions.updateColPaymentApprovalRequest, (state) => ({
        ...state,
        isLoading: false,
    })),
    on(RejectReasonActions.updateBillingPaymentApprovalRequest, (state) => ({
        ...state,
        isLoading: false,
    })),
    on(RejectReasonActions.fetchRejectReasonFailure, (state) => ({
        ...state,
        isLoading: false,
    })),
    on(RejectReasonActions.updateColPaymentApprovalFailure, (state) => ({
        ...state,
        isLoading: false,
    })),
    on(RejectReasonActions.updateBillingPaymentApprovalFailure, (state) => ({
        ...state,
        isLoading: false,
    })),
    on(RejectReasonActions.fetchRejectReasonSuccess, (state, { payload }) =>
        adapter.addAll(payload.data, { ...state, isLoading: false, total: payload.data.length })
    ),
    on(RejectReasonActions.updateColPaymentApprovalSuccess, (state, { payload }) =>
        adapter.updateOne(payload, { ...state, isLoading: false })
    ),
    on(RejectReasonActions.updateBillingPaymentApprovalSuccess, (state, { payload }) => {
        return adapter.updateOne(payload, { ...state, isLoading: false })
    }),
    on(RejectReasonActions.clearState, RejectReasonActions.clearRejectReason, () => initialState)
);