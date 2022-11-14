import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on, combineReducers } from '@ngrx/store';
import { ICancelReason } from '../../models';
import { OrderActions } from '../actions';
import { IErrorHandler } from 'app/shared/models/global.model';
import * as fromRoot from 'app/store/app.reducer';

// Keyname for reducer
export const FEATURE_KEY = 'cancelOrderReasonLists';

export interface CancelOrderReasonState extends EntityState<ICancelReason> {
    selectedId: string | number;
    total: number;
}

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
    isLoading: boolean;
    errors: ErrorState;
    cancelOrderReason: CancelOrderReasonState;
    isConfirmedCancelOrder: boolean;
}

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

export const adapterCancelOrderReason = createEntityAdapter<ICancelReason>({ selectId: (row) => row.reasonId });

export const initialStateCancelOrderReasonList: CancelOrderReasonState = adapterCancelOrderReason.getInitialState({
    selectedId: null,
    total: 0,
});

const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

const initialState: State = {
    isLoading: false,
    cancelOrderReason: initialStateCancelOrderReasonList,
    errors: initialErrorState,
    isConfirmedCancelOrder: false,
};

// Create the reducer.
export const reducerFn = createReducer(
    initialState,
    on(
        OrderActions.fetchCancelOrderReasonRequest, 
        OrderActions.updateStatusOrderWithReasonRequest,
        (state) => ({
            ...state,
            isLoading: true,
        })
    ),
    on(OrderActions.updateStatusOrderWithReasonRequest,  (state) => ({
        ...state,
        isConfirmedCancelOrder: true,
    })),
    on(
        OrderActions.fetchCancelOrderReasonFailure, 
        OrderActions.updateStatusOrderWithReasonFailure,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            isConfirmedCancelOrder: false,
            errors: adapterError.upsertOne(payload, state.errors),
        })
    ),
    on(OrderActions.fetchCancelOrderReasonSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        cancelOrderReason: adapterCancelOrderReason.addAll(payload['data'], { ...state.cancelOrderReason, selectedOrderId: payload['data']['id']  }),
        errors: adapterError.removeOne('fetchCancelOrderReasonFailure', state.errors),
    })),
    on(OrderActions.updateStatusOrderWithReasonSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isConfirmedCancelOrder: false,
        errors: adapterError.removeOne('updateStatusOrderWithReasonFailure', state.errors),
    })),
);

export function reducer(state: State | undefined, action: Action): State {
    return reducerFn(state, action);
};
