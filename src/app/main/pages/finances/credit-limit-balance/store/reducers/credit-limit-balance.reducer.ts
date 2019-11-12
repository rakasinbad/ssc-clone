import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler, TSource } from 'app/shared/models';
import * as fromRoot from 'app/store/app.reducer';

import { CreditLimitGroup, ICreditLimitBalanceDemo } from '../../models';
import { CreditLimitBalanceActions } from '../actions';

export const FEATURE_KEY = 'creditLimitBalance';

interface CreditLimitBalanceState extends EntityState<ICreditLimitBalanceDemo> {
    total: number;
}

interface CreditLimitGroupState extends EntityState<CreditLimitGroup> {}

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
    isRefresh?: boolean;
    isLoading: boolean;
    selectedCreditLimitBalanceId: string | number;
    selectedCreditLimitGroupId?: string | number;
    source: TSource;
    creditLimitBalanceGroups?: CreditLimitGroupState;
    creditLimitBalance: CreditLimitBalanceState;
    errors: ErrorState;
}

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

const adapterCreditLimitBalance = createEntityAdapter<ICreditLimitBalanceDemo>({
    selectId: row => row.id
});
const initialCreditLimitBalanceState = adapterCreditLimitBalance.getInitialState({ total: 0 });

const adapterCreditLimitGroup = createEntityAdapter<CreditLimitGroup>({
    selectId: row => row.id
});
const initialCreditLimitGroupState = adapterCreditLimitGroup.getInitialState();

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
    on(CreditLimitBalanceActions.fetchCreditLimitGroupsRequest, (state, { payload }) => ({
        ...state,
        isLoading: true
    })),
    on(CreditLimitBalanceActions.fetchCreditLimitGroupsFailure, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isRefresh: undefined,
        errors: adapterError.upsertOne(payload, state.errors)
    })),
    on(CreditLimitBalanceActions.fetchCreditLimitGroupsSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isRefresh: undefined,
        creditLimitBalanceGroups: adapterCreditLimitGroup.addAll(
            payload,
            state.creditLimitBalanceGroups
        ),
        errors: adapterError.removeOne('fetchCreditLimitGroupsFailure', state.errors)
    })),
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

const getCreditLimitGroupsState = (state: State) => state.creditLimitBalanceGroups;
const getListCreditLimitBalanceState = (state: State) => state.creditLimitBalance;

export const {
    selectAll: selectAllCreditLimitGroup,
    selectEntities: selectCreditLimitGroupEntities,
    selectIds: selectCreditLimitGroupIds,
    selectTotal: selectCreditLimitGroupTotal
} = adapterCreditLimitGroup.getSelectors(getCreditLimitGroupsState);

export const {
    selectAll: selectAllCreditLimitBalance,
    selectEntities: selectCreditLimitBalanceEntities,
    selectIds: selectCreditLimitBalanceIds,
    selectTotal: selectCreditLimitBalanceTotal
} = adapterCreditLimitBalance.getSelectors(getListCreditLimitBalanceState);
