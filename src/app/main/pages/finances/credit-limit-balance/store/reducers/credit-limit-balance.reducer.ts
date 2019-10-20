import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler, TSource } from 'app/shared/models';
import * as fromRoot from 'app/store/app.reducer';

import { ICreditLimitBalanceDemo } from '../../models';
import { CreditLimitBalanceActions } from '../actions';

export const FEATURE_KEY = 'creditLimitBalance';

interface CreditLimitBalanceState extends EntityState<ICreditLimitBalanceDemo> {
    total: number;
}

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
    isLoading: boolean;
    selectedCreditLimitBalanceId: string | number;
    source: TSource;
    creditLimitBalance: CreditLimitBalanceState;
    errors: ErrorState;
}

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

const adapterCreditLimitBalance = createEntityAdapter<ICreditLimitBalanceDemo>({
    selectId: creditLimitBalance => creditLimitBalance.id
});
const initialCreditLimitBalanceState = adapterCreditLimitBalance.getInitialState({ total: 0 });

const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

export const initialState: State = {
    isLoading: false,
    selectedCreditLimitBalanceId: null,
    source: 'fetch',
    creditLimitBalance: initialCreditLimitBalanceState,
    errors: initialErrorState
};

const creditLimitBalanceReducer = createReducer(
    initialState,
    on(CreditLimitBalanceActions.generateCreditLimitBalanceDemo, (state, { payload }) => ({
        ...state,
        creditLimitBalance: adapterCreditLimitBalance.addAll(payload, state.creditLimitBalance)
    })),
    on(CreditLimitBalanceActions.getCreditLimitBalanceDemoDetail, (state, { payload }) => ({
        ...state,
        selectedCreditLimitBalanceId: payload
    }))
);

export function reducer(state: State | undefined, action: Action): State {
    return creditLimitBalanceReducer(state, action);
}

const getListCreditLimitBalanceState = (state: State) => state.creditLimitBalance;

export const {
    selectAll: selectAllCreditLimitBalance,
    selectEntities: selectCreditLimitBalanceEntities,
    selectIds: selectCreditLimitBalanceIds,
    selectTotal: selectCreditLimitBalanceTotal
} = adapterCreditLimitBalance.getSelectors(getListCreditLimitBalanceState);
