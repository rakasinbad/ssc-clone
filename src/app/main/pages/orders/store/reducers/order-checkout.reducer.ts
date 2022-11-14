import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { ProductCheckout } from '../../models';
import { OrderCheckoutActions } from '../actions';

// Keyname for reducer
export const orderCheckoutFeatureKey = 'orderCheckouts';

export interface State extends EntityState<ProductCheckout> {
    isLoading: boolean;
    isRefresh: boolean;
    selectedId: string;
    dataCheckout: ProductCheckout;
}

export const adapter = createEntityAdapter<ProductCheckout>({ selectId: (row) => row.cartId });

// Initialize state
export const initialStateOrderCheckoutList: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    isRefresh: undefined,
    selectedId: null,
    dataCheckout: null
});

// Create the reducer.
export const reducerFn = createReducer(
    initialStateOrderCheckoutList,
    on(OrderCheckoutActions.fetchCheckoutOrderRequest, (state) => ({
        ...state,
        isLoading: true,
    })),
    on(OrderCheckoutActions.fetchCheckoutOrderFailure, (state) => ({
        ...state,
        isLoading: false,
    })),
    on(OrderCheckoutActions.fetchCheckoutOrderSuccess, (state, { payload }) =>
        adapter.addOne(payload, { ...state, isLoading: false,  dataCheckout: payload, })
    ),
    on(OrderCheckoutActions.fetchCheckoutOrderWithErrorConfirmOrder, (state, { payload }) => {
        const dataCheckoutItems = state.dataCheckout.items.map(product => {
            const orderParcelId = Number(product.orderParcelId);
            const errorItemParcerId = payload.find(item => orderParcelId === item.parcelId);
            
            if (errorItemParcerId) {
                return {
                    ...product,
                    minTrx: errorItemParcerId.minimumOrder
                }
            } else {
                return product;
            }
        });

        return adapter.addOne(state.dataCheckout, { 
            ...state,
            isLoading: false,
            dataCheckout: {
                ...state.dataCheckout,
                items: dataCheckoutItems
            },
        })
    }),
    on(OrderCheckoutActions.setRefreshStatusCheckout, (state, { payload }) => ({
        ...state,
        needRefresh: payload,
    })),
    on(OrderCheckoutActions.clearState, () => initialStateOrderCheckoutList)
);

export function reducer(state: State | undefined, action: Action): State {
    return reducerFn(state, action);
}
