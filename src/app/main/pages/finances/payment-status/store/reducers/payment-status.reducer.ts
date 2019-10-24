import { createReducer, Action, on } from '@ngrx/store';
import { EntityState, createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { IErrorHandler } from 'app/shared/models';
import { TSource } from 'app/shared/models/global.model';
import * as fromRoot from 'app/store/app.reducer';

import { IPaymentStatusDemo } from './../../models';
import { PaymentStatusActions } from '../actions';

export const FEATURE_KEY = 'paymentStatus';

interface PaymentStatusState extends EntityState<IPaymentStatusDemo> {
    total: number;
}

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
    isLoading: boolean;
    selectedPaymentStatusId: string | number;
    source: TSource;
    paymentStatus: PaymentStatusState;
    errors: ErrorState;
}

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

const adapterPaymentStatus = createEntityAdapter<IPaymentStatusDemo>({
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
    on(PaymentStatusActions.generatePaymentsDemo, (state, { payload }) => ({
        ...state,
        paymentStatus: adapterPaymentStatus.addAll(payload, state.paymentStatus)
    }))
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
