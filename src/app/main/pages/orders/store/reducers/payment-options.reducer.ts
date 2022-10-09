import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { PaymentValidation } from '../../models';
import { PaymentOptionActions } from '../actions';

// Keyname for reducer
export const paymentOptionFeatureKey = 'paymentOptionLists';

export interface State extends EntityState<PaymentValidation> {
    isLoading: boolean;
    isRefresh: boolean;
    selectedId: string;
    total: number;
}

export const adapter = createEntityAdapter<PaymentValidation>({ selectId: (row) => row.id });

export const initialStatePaymValidList: State = adapter.getInitialState({
    isLoading: false,
    isRefresh: false,
    selectedId: null,
    total: 0,
});

// Create the reducer.
export const reducerFn = createReducer(
    initialStatePaymValidList,
    on(PaymentOptionActions.fetchPaymentValidRequest, (state) => ({
        ...state,
        isLoading: true,
    })),
    on(PaymentOptionActions.fetchPaymentValidFailure, (state) => ({
        ...state,
        isLoading: false,
    })),
    on(PaymentOptionActions.fetchPaymentValidSuccess, (state, { payload }) =>
        adapter.addAll(payload.data, { ...state, isLoading: false, orderParcelId: payload.orderParcelId, brandName: payload.brandName })
    ),
    on(PaymentOptionActions.setRefreshPaymentValid, (state, { payload }) => ({
        ...state,
        needRefresh: payload,
    })),
    on(PaymentOptionActions.clearState, () => initialStatePaymValidList)
);

export function reducer(state: State | undefined, action: Action): State {
    return reducerFn(state, action);
}
