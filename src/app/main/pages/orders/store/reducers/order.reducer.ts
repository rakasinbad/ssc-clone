import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler, TSource } from 'app/shared/models';
import * as fromRoot from 'app/store/app.reducer';

import { OrderActions } from '../actions';

export const FEATURE_KEY = 'orders';

interface OrderState extends EntityState<any> {
    selectedOrderId: string | number;
    total: number;
}

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
    isRefresh?: boolean;
    isLoading: boolean;
    source: TSource;
    orders: OrderState;
    errors: ErrorState;
}

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

const adapterOrder = createEntityAdapter<any>({
    selectId: row => row.id
});
const initialOrderState = adapterOrder.getInitialState({ selectedOrderId: null, total: 0 });

const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

const initialState: State = {
    isLoading: false,
    source: 'fetch',
    orders: initialOrderState,
    errors: initialErrorState
};

const orderReducer = createReducer(
    initialState,
    on(
        OrderActions.updateCancelStatusRequest,
        OrderActions.updateStatusOrderRequest,
        OrderActions.fetchOrderRequest,
        OrderActions.fetchOrdersRequest,
        state => ({
            ...state,
            isLoading: true
        })
    ),
    on(
        OrderActions.updateCancelStatusFailure,
        OrderActions.updateStatusOrderFailure,
        OrderActions.fetchOrderFailure,
        OrderActions.fetchOrdersFailure,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            isRefresh: undefined,
            errors: adapterError.upsertOne(payload, state.errors)
        })
    ),
    on(OrderActions.updateDeliveredQtyRequest, OrderActions.updateInvoicedQtyRequest, state => ({
        ...state,
        isLoading: true,
        isRefresh: false
    })),
    on(
        OrderActions.updateDeliveredQtyFailure,
        OrderActions.updateInvoicedQtyFailure,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            isRefresh: true,
            errors: adapterError.upsertOne(payload, state.errors)
        })
    ),
    on(OrderActions.fetchOrderSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isRefresh: undefined,
        orders: adapterOrder.addOne(payload, { ...state.orders, selectedOrderId: payload.id }),
        errors: adapterError.removeOne('fetchOrderFailure', state.errors)
    })),
    on(OrderActions.fetchOrdersSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isRefresh: undefined,
        orders: adapterOrder.addAll(payload.data, { ...state.orders, total: payload.total }),
        errors: adapterError.removeOne('fetchOrdersFailure', state.errors)
    })),
    on(OrderActions.updateDeliveredQtySuccess, state => ({
        ...state,
        isLoading: false,
        isRefresh: true,
        orders: initialState.orders,
        errors: adapterError.removeOne('updateDeliveredQtyFailure', state.errors)
    })),
    on(OrderActions.updateInvoicedQtySuccess, state => ({
        ...state,
        isLoading: false,
        isRefresh: true,
        orders: initialState.orders,
        errors: adapterError.removeOne('updateInvoicedQtyFailure', state.errors)
    })),
    on(OrderActions.updateCancelStatusSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        orders: adapterOrder.updateOne(payload, state.orders),
        errors: adapterError.removeOne('updateCancelStatusFailure', state.errors)
    })),
    on(OrderActions.updateStatusOrderSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        orders: adapterOrder.updateOne(payload, state.orders),
        errors: adapterError.removeOne('updateStatusOrderFailure', state.errors)
    })),
    on(OrderActions.filterOrder, (state, { payload }) => ({
        ...state,
        isRefresh: true
    })),
    on(OrderActions.resetOrders, state => ({
        ...state,
        orders: initialState.orders,
        errors: adapterError.removeOne('fetchOrdersFailure', state.errors)
    }))
    // on(OrderActions.generateOrdersDemo, (state, { payload }) => ({
    //     ...state,
    //     orders: adapterOrder.addAll(payload, state.orders)
    // })),
    // on(OrderActions.getOrderDemoDetail, (state, { payload }) => ({
    //     ...state,
    //     selectedOrderId: payload
    // }))
);

export function reducer(state: State | undefined, action: Action): State {
    return orderReducer(state, action);
}

const getOrdersState = (state: State) => state.orders;

export const {
    selectAll: selectAllOrder,
    selectEntities: selectOrderEntities,
    selectIds: selectOrderIds,
    selectTotal: selectOrderTotal
} = adapterOrder.getSelectors(getOrdersState);
