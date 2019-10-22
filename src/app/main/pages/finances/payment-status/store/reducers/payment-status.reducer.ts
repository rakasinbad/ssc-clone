import { createReducer, Action } from '@ngrx/store';
import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { IErrorHandler } from 'app/shared/models';
import { TSource } from 'app/shared/models/global.model';
import * as fromRoot from 'app/store/app.reducer';

import { IPaymentStatusDemo } from './../../models';

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
    selectId: paymentStatus => paymentStatus.orderRef
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

const paymentStatusReducer = createReducer(initialState);

export function reducer(state: State | undefined, action: Action): State {
    return paymentStatusReducer(state, action);
}

const getListPaymentStatusState = (state: State) => state.paymentStatus;

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal
} = adapterPaymentStatus.getSelectors(getListPaymentStatusState);
