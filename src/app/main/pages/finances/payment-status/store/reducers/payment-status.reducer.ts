import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler, TSource } from 'app/shared/models/global.model';
import * as fromRoot from 'app/store/app.reducer';

import { IStatusPayment } from '../../models';
import { PaymentStatusActions } from '../actions';
import { OrderActions } from '../../../../orders/store/actions';

export const FEATURE_KEY = 'paymentStatuses';

interface PaymentStatusState extends EntityState<any> {
    selectedPaymentStatusId: string | number;
    total: number;
    totalStatus: IStatusPayment;
}

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
    isRefresh?: boolean;
    isLoading: boolean;
    // selectedPaymentStatusId: string | number;
    source: TSource;
    paymentStatuses: PaymentStatusState;
    invoiceFetching: boolean;
    invoice: {
        fileName: string;
        url: string;
    };
    errors: ErrorState;
}

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

const adapterPaymentStatus = createEntityAdapter<any>({
    selectId: paymentStatus => paymentStatus.id
});
const initialPaymentStatus = adapterPaymentStatus.getInitialState({
    selectedPaymentStatusId: null,
    total: 0,
    totalStatus: {
        totalOrder: '0',
        totalWaitingForPaymentOrder: '0',
        totalD7PaymentOrder: '0',
        totalD3PaymentOrder: '0',
        totalD0PaymentOrder: '0',
        totalPaidOrder: '0',
        totalPaymentFailedOrder: '0',
        totalOverdueOrder: '0'
    }
});

const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

export const initialState: State = {
    isLoading: false,
    // selectedPaymentStatusId: null,
    source: 'fetch',
    invoiceFetching: false,
    invoice: {
        url: undefined,
        fileName: undefined
    },
    paymentStatuses: initialPaymentStatus,
    errors: initialErrorState
};

const paymentStatusReducer = createReducer(
    initialState,
    on(
        PaymentStatusActions.fetchPaymentStatusesRequest,
        PaymentStatusActions.exportRequest,
        PaymentStatusActions.importRequest,
        state => ({
            ...state,
            isLoading: true
        })
    ),
    on(
        PaymentStatusActions.fetchPaymentStatusesFailure,
        PaymentStatusActions.fetchCalculateOrdersByPaymentFailure,
        PaymentStatusActions.exportFailure,
        PaymentStatusActions.importFailure,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            isRefresh: undefined,
            errors: adapterError.upsertOne(payload, state.errors)
        })
    ),
    on(PaymentStatusActions.exportSuccess, state => ({
        ...state,
        isLoading: false,
        errors: adapterError.removeOne('exportFailure', state.errors)
    })),
    on(PaymentStatusActions.importSuccess, state => ({
        ...state,
        isLoading: false,
        isRefresh: true,
        errors: adapterError.removeOne('importFailure', state.errors)
    })),
    on(PaymentStatusActions.updatePaymentStatusRequest, state => ({
        ...state,
        isLoading: true,
        isRefresh: false
    })),
    on(PaymentStatusActions.updatePaymentStatusFailure, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isRefresh: true,
        errors: adapterError.upsertOne(payload, state.errors)
    })),
    on(PaymentStatusActions.filterStatusPayment, (state, { payload }) => ({
        ...state,
        isRefresh: true
    })),
    on(PaymentStatusActions.fetchCalculateOrdersByPaymentSuccess, (state, { payload }) => ({
        ...state,
        paymentStatuses: {
            ...state.paymentStatuses,
            totalStatus: payload
        },
        errors: adapterError.removeOne('fetchCalculateOrdersByPaymentFailure', state.errors)
    })),
    on(PaymentStatusActions.fetchPaymentStatusesSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isRefresh: undefined,
        paymentStatuses: adapterPaymentStatus.addAll(payload.data, {
            ...state.paymentStatuses,
            total: payload.total
        }),
        errors: adapterError.removeOne('fetchPaymentStatusesFailure', state.errors)
    })),
    on(PaymentStatusActions.updatePaymentStatusSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isRefresh: true,
        paymentStatuses: initialState.paymentStatuses,
        // paymentStatuses: adapterPaymentStatus.updateOne(payload, {
        //     ...state.paymentStatuses,
        //     selectedPaymentStatusId: null
        // }),
        errors: adapterError.removeOne('updatePaymentStatusFailure', state.errors)
    })),
    on(PaymentStatusActions.resetPaymentStatuses, state => ({
        ...state,
        paymentStatuses: initialState.paymentStatuses,
        errors: adapterError.removeOne('fetchPaymentStatusesFailure', state.errors)
    })),
    on(PaymentStatusActions.fetchInvoiceOrder, (state => ({
        ...state,
        invoiceFetching: true,
    }))),
    on(PaymentStatusActions.fetchInvoiceSuccess, (state, { payload }) => ({
        ...state,
        invoiceFetching: false,
        isRefresh: undefined,
        invoice: {
            fileName: payload.fileName,
            url: payload.url
        },
        errors: adapterError.removeOne('fetchOrderFailure', state.errors),
    })),
    on(PaymentStatusActions.fetchInvoiceFailed, (state, { payload }) => ({
        ...state,
        invoiceFetching: false,
        isRefresh: undefined,
        invoice: null,
        errors: adapterError.removeOne('fetchOrdersFailure', state.errors),
    })),
    // on(PaymentStatusActions.generatePaymentsDemo, (state, { payload }) => ({
    //     ...state,
    //     paymentStatus: adapterPaymentStatus.addAll(payload, state.paymentStatus)
    // }))
);

export function reducer(state: State | undefined, action: Action): State {
    return paymentStatusReducer(state, action);
}

const getPaymentStatusesState = (state: State) => state.paymentStatuses;

export const {
    selectAll: selectAllPaymentStatus,
    selectEntities: selectPaymentStatusEntities,
    selectIds: selectPaymentStatusIds,
    selectTotal: selectPaymentStatusTotal
} = adapterPaymentStatus.getSelectors(getPaymentStatusesState);
