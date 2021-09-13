import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { BillingStatus, FinanceDetailCollection } from '../../models';
import { CollectionActions } from '../actions';

// Keyname for reducer
export const featureKey = 'billingStatus';

export interface State extends EntityState<BillingStatus> {
    isLoading: boolean;
    isRefresh: boolean;
    selectedId: string;
    total: number;
}

export interface StateDetail extends EntityState<FinanceDetailCollection> {
    isLoading: boolean;
    isRefresh: boolean;
    selectedId: string;
    total: number;
}

// Adapter for Billing state
export const adapter = createEntityAdapter<BillingStatus>({
    selectId: (row) => row.id,
});

// Adapter for Detail state
export const adapterDetail = createEntityAdapter<FinanceDetailCollection>({
    selectId: (row) => row.id,
});


// Initialize state
export const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    isRefresh: undefined,
    selectedId: null,
    total: 0,
});

// Initialize state
export const initialStateDetail: StateDetail = adapterDetail.getInitialState<Omit<StateDetail, 'ids' | 'entities'>>({
    isLoading: false,
    isRefresh: undefined,
    selectedId: null,
    total: 0,
});

// Create the reducer.
export const reducer = createReducer(
    initialState,
    on(
        CollectionActions.fetchBillingStatusRequest,
        // CollectionActions.updateCollectionStatusRequest,
        (state) => ({
            ...state,
            isLoading: true,
        })
    ),
    on(
        CollectionActions.fetchBillingStatusFailure,
        // CollectionActions.updateCollectionStatusFailure,
        (state) => ({
            ...state,
            isLoading: false,
        })
    ),
    on(CollectionActions.fetchBillingStatusSuccess, (state, { payload }) =>
        adapter.addAll(payload.data, { ...state, isLoading: false, total: payload.total })
    ),
    on(CollectionActions.setRefreshStatus, (state, { payload }) => ({
        ...state,
        needRefresh: payload,
    })),
    on(CollectionActions.clearState, () => initialState)
);
