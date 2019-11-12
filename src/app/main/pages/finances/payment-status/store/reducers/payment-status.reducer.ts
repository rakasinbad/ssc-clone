import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler } from 'app/shared/models';
import { TSource } from 'app/shared/models/global.model';
import * as fromRoot from 'app/store/app.reducer';

import { PaymentStatusActions } from '../actions';

export const FEATURE_KEY = 'paymentStatus';

interface PaymentStatusState extends EntityState<any> {
    total: number;
}

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
    isRefresh?: boolean;
    isLoading: boolean;
    selectedPaymentStatusId: string | number;
    source: TSource;
    paymentStatus: PaymentStatusState;
    errors: ErrorState;
}

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

const adapterPaymentStatus = createEntityAdapter<any>({
    selectId: paymentStatus => paymentStatus.id
});
const initialPaymentStatus = adapterPaymentStatus.getInitialState({ total: 0 });

const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

export const initialState: State = {
    isLoading: false,
    selectedPaymentStatusId: null,
    source: 'fetch',
    paymentStatus: initialPaymentStatus,
    errors: initialErrorState
};

const paymentStatusReducer = createReducer(
    initialState,
    on(PaymentStatusActions.fetchPaymentStatusRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(PaymentStatusActions.fetchPaymentStatusFailure, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isRefresh: undefined,
        errors: adapterError.upsertOne(payload, state.errors)
    })),
    on(PaymentStatusActions.filterStatusPayment, (state, { payload }) => ({
        ...state,
        isRefresh: true
    })),
    on(PaymentStatusActions.fetchPaymentStatusSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isRefresh: undefined,
        paymentStatus: adapterPaymentStatus.addAll(payload.paymentStatus, {
            ...state.paymentStatus,
            total: payload.total
        }),
        errors: adapterError.removeOne('fetchPaymentFailure', state.errors)
    })),
    on(PaymentStatusActions.resetPaymentStatus, state => ({
        ...state,
        paymentStatus: initialState.paymentStatus,
        errors: adapterError.removeOne('fetchPaymentFailure', state.errors)
    }))
    // on(PaymentStatusActions.generatePaymentsDemo, (state, { payload }) => ({
    //     ...state,
    //     paymentStatus: adapterPaymentStatus.addAll(payload, state.paymentStatus)
    // }))
);

export function reducer(state: State | undefined, action: Action): State {
    return paymentStatusReducer(state, action);
}

const getListPaymentStatusState = (state: State) => state.paymentStatus;

export const {
    selectAll: selectAllPaymentStatus,
    selectEntities: selectPaymentStatusEntities,
    selectIds: selectPaymentStatusIds,
    selectTotal: selectPaymentStatusTotal
} = adapterPaymentStatus.getSelectors(getListPaymentStatusState);
