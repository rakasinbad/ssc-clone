import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler, TSource } from 'app/shared/models';
import * as fromRoot from 'app/store/app.reducer';

import { IOrderDemo } from '../../models';
import { OrderActions } from '../actions';

export const FEATURE_KEY = 'orders';

interface OrderState extends EntityState<IOrderDemo> {
    total: number;
}

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
    isLoading: boolean;
    selectedOrderId: string | number;
    source: TSource;
    orders: OrderState;
    errors: ErrorState;
}

const adapterOrder = createEntityAdapter<IOrderDemo>({
    selectId: order => order.id
});
const initialOrderState = adapterOrder.getInitialState({ total: 0 });

const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

const initialState: State = {
    isLoading: false,
    selectedOrderId: null,
    source: 'fetch',
    orders: initialOrderState,
    errors: initialErrorState
};

const orderReducer = createReducer(
    initialState,
    on(OrderActions.generateOrdersDemo, (state, { payload }) => ({
        ...state,
        orders: adapterOrder.addAll(payload, state.orders)
    })),
    on(OrderActions.getOrderDemoDetail, (state, { payload }) => ({
        ...state,
        selectedOrderId: payload
    }))
);

export function reducer(state: State | undefined, action: Action): State {
    return orderReducer(state, action);
}

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

const getListOrderState = (state: State) => state.orders;

export const {
    selectAll: selectAllOrders,
    selectEntities: selectOrderEntities,
    selectIds: selectOrderIds,
    selectTotal: selectOrdersTotal
} = adapterOrder.getSelectors(getListOrderState);
