import { Action, createReducer, on } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';
import { ConfirmOrderPaymentActions } from '../actions';

export interface ILimitOrder {
    message: string;
    minimumOrder: number;
    parcelId: number;
    parcelNettPrice: number
}

export interface IError {
    errorCode: string;
    errorData: object | Object[] | ILimitOrder[];
    requestId: string;
    uri: string;
}

export const FEATURE_KEY = 'confirm_order_payment';

export interface State {
    isLoading: boolean;
    data: any;
    error: IError;
}

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

const initialState: State = {
    isLoading: false,
    data: null,
    error: {
        errorCode: null,
        errorData: null,
        requestId: null,
        uri: null
    },
};

const confirmOrderPaymentReducer = createReducer(
    initialState,

    on(ConfirmOrderPaymentActions.postConfirmRequest, (state) => ({
        ...state,
        isLoading: true,
        error: null,
        data: null
    })),

    on(ConfirmOrderPaymentActions.postConfirmSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        data: payload,
    })),

    on(ConfirmOrderPaymentActions.postConfirmFailure, (state, { payload }) => ({
        ...state,
        isLoading: false,
        error: payload
    })),

    on(ConfirmOrderPaymentActions.resetState, () => initialState)
);

export function reducer(state: State | undefined, action: Action): State {
    return confirmOrderPaymentReducer(state, action);
}
