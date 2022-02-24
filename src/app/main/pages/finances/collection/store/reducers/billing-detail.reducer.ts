import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import {  FinanceDetailBillingV1 } from '../../models';
import { BillingActions } from '../actions';

// Keyname for reducer
export const featureKey = 'billingDetailStatus';

//state detail
export interface State extends EntityState<FinanceDetailBillingV1> {
    isLoading: boolean;
    isRefresh: boolean;
    selectedId: string;
    total: number;
}
// Adapter for Detail state
export const adapterDetail = createEntityAdapter<FinanceDetailBillingV1>({
    selectId: (row) => row.data.id,
});

export const adapterCollectionHistory = createEntityAdapter<any>({
    // selectId: (row) => row.billingPaymentId,
})

// Initialize state
export const initialStateDetail: State = adapterDetail.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    isRefresh: undefined,
    selectedId: null,
    total: 0,
})


// Create the reducer.
export const reducer = createReducer(
    initialStateDetail,
    on(
        BillingActions.fetchBillingDetailRequest,
        // BillingActions.updateCollectionStatusRequest,
        (state, { payload }) => {
            return {
                ...state,
                isLoading: true,
                selectedId: payload.id,
            };
        }
    ),
    on(
        BillingActions.fetchBillingDetailUpdateRequest,
        (state, { payload }) => {
            return {
                ...state,
                isLoading: true,
                selectedId: payload.idDetail,
            };
        }
    ),
    on(
        BillingActions.fetchBillingDetailFailure,
        // BillingActions.updateCollectionStatusFailure,
        (state) => ({
            ...state,
            isLoading: false,
        })
    ),
    on(BillingActions.fetchBillingDetailSuccess, (state, { payload }) => {
        return adapterDetail.addOne(payload, { ...state, isLoading: false })
    }),
    on(BillingActions.setRefreshStatus, (state, { payload }) => ({
        ...state,
        needRefresh: payload,
    })),
    on(BillingActions.clearState, () => initialStateDetail),
);
