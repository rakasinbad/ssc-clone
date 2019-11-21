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
    on(OrderActions.fetchOrderRequest, OrderActions.fetchOrdersRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(OrderActions.fetchOrderFailure, OrderActions.fetchOrdersFailure, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isRefresh: undefined,
        errors: adapterError.upsertOne(payload, state.errors)
    })),
    on(OrderActions.fetchOrdersSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isRefresh: undefined,
        orders: adapterOrder.addAll(payload.data, { ...state.orders, total: payload.total }),
        errors: adapterError.removeOne('fetchOrdersFailure', state.errors)
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
