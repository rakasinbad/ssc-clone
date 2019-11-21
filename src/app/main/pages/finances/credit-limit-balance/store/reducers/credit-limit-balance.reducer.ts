import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler, TSource } from 'app/shared/models';
import * as fromRoot from 'app/store/app.reducer';

import { CreditLimitGroup, CreditLimitStore } from '../../models';
import { CreditLimitBalanceActions } from '../actions';

export const FEATURE_KEY = 'creditLimitBalances';

interface CreditLimitStoreState extends EntityState<CreditLimitStore> {
    selectedCreditLimitStoreId: string | number;
    total: number;
}

interface CreditLimitGroupState extends EntityState<CreditLimitGroup> {}

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
    isRefresh?: boolean;
    isLoading: boolean;
    // selectedCreditLimitStoreId?: string | number;
    selectedCreditLimitGroupId?: string | number;
    source: TSource;
    creditLimitBalanceGroups: CreditLimitGroupState;
    creditLimitBalanceStores: CreditLimitStoreState;
    errors: ErrorState;
}

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

const adapterCreditLimitStore = createEntityAdapter<CreditLimitStore>({
    selectId: row => row.id
});
const initialCreditLimitStoreState = adapterCreditLimitStore.getInitialState({
    selectedCreditLimitStoreId: null,
    total: 0
});

const adapterCreditLimitGroup = createEntityAdapter<CreditLimitGroup>({
    selectId: row => row.id
});
const initialCreditLimitGroupState = adapterCreditLimitGroup.getInitialState();

const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

export const initialState: State = {
    isLoading: false,
    source: 'fetch',
    creditLimitBalanceGroups: initialCreditLimitGroupState,
    creditLimitBalanceStores: initialCreditLimitStoreState,
    errors: initialErrorState
};

const creditLimitBalanceReducer = createReducer(
    initialState,
    on(
        CreditLimitBalanceActions.updateCreditLimitStoreRequest,
        CreditLimitBalanceActions.updateStatusFreezeBalanceRequest,
        CreditLimitBalanceActions.createCreditLimitGroupRequest,
        CreditLimitBalanceActions.fetchCreditLimitStoreRequest,
        CreditLimitBalanceActions.fetchCreditLimitStoresRequest,
        CreditLimitBalanceActions.fetchCreditLimitGroupsRequest,
        (state, { payload }) => ({
            ...state,
            isLoading: true
        })
    ),
    // on(CreditLimitBalanceActions.updateStatusFreezeBalanceRequest, state => ({
    //     ...state,
    //     isLoading: true,
    //     isRefresh: false
    // })),
    on(
        CreditLimitBalanceActions.updateCreditLimitStoreFailure,
        CreditLimitBalanceActions.updateStatusFreezeBalanceFailure,
        CreditLimitBalanceActions.createCreditLimitGroupFailure,
        CreditLimitBalanceActions.fetchCreditLimitStoreFailure,
        CreditLimitBalanceActions.fetchCreditLimitStoresFailure,
        CreditLimitBalanceActions.fetchCreditLimitGroupsFailure,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            isRefresh: undefined,
            errors: adapterError.upsertOne(payload, state.errors)
        })
    ),
    on(CreditLimitBalanceActions.fetchCreditLimitStoresSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isRefresh: undefined,
        creditLimitBalanceStores: adapterCreditLimitStore.addAll(payload.data, {
            ...state.creditLimitBalanceStores,
            total: payload.total
        }),
        errors: adapterError.removeOne('fetchCreditLimitStoresFailure', state.errors)
    })),
    on(CreditLimitBalanceActions.fetchCreditLimitStoreSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        creditLimitBalanceStores: adapterCreditLimitStore.updateOne(payload.data, {
            ...state.creditLimitBalanceStores,
            selectedCreditLimitStoreId: payload.id
        }),
        errors: adapterError.removeOne('fetchCreditLimitStoreFailure', state.errors)
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
    on(CreditLimitBalanceActions.updateCreditLimitStoreSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        creditLimitBalanceStores: adapterCreditLimitStore.updateOne(payload, {
            ...state.creditLimitBalanceStores,
            selectedCreditLimitStoreId: null
        }),
        errors: adapterError.removeOne('updateCreditLimitStoreFailure', state.errors)
    })),
    // on(CreditLimitBalanceActions.updateStatusFreezeBalanceFailure, (state, { payload }) => ({
    //     ...state,
    //     isLoading: false,
    //     isRefresh: true,
    //     errors: adapterError.upsertOne(payload, state.errors)
    // })),
    on(CreditLimitBalanceActions.updateStatusFreezeBalanceSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        creditLimitBalanceStores: adapterCreditLimitStore.updateOne(
            payload,
            state.creditLimitBalanceStores
        ),
        errors: adapterError.removeOne('updateStatusFreezeBalanceFailure', state.errors)
    })),
    on(CreditLimitBalanceActions.createCreditLimitGroupSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        creditLimitBalanceGroups: adapterCreditLimitGroup.addOne(
            payload,
            state.creditLimitBalanceGroups
        ),
        errors: adapterError.removeOne('createCreditLimitGroupFailure', state.errors)
    }))
    // on(CreditLimitBalanceActions.generateCreditLimitBalanceDemo, (state, { payload }) => ({
    //     ...state,
    //     creditLimitBalance: adapterCreditLimitBalance.addAll(payload, state.creditLimitBalance)
    // })),
    // on(CreditLimitBalanceActions.getCreditLimitBalanceDemoDetail, (state, { payload }) => ({
    //     ...state,
    //     selectedCreditLimitBalanceId: payload
    // }))
);

export function reducer(state: State | undefined, action: Action): State {
    return creditLimitBalanceReducer(state, action);
}

const getCreditLimitStoresState = (state: State) => state.creditLimitBalanceStores;
const getCreditLimitGroupsState = (state: State) => state.creditLimitBalanceGroups;

// export const getSelectedCreditLimitStoreId = (state: State) => state.creditLimitBalanceStores.selectedCreditLimitStoreId;

export const {
    selectAll: selectAllCreditLimitGroup,
    selectEntities: selectCreditLimitGroupEntities,
    selectIds: selectCreditLimitGroupIds,
    selectTotal: selectCreditLimitGroupTotal
} = adapterCreditLimitGroup.getSelectors(getCreditLimitGroupsState);

export const {
    selectAll: selectAllCreditLimitStore,
    selectEntities: selectCreditLimitStoreEntities,
    selectIds: selectCreditLimitStoreIds,
    selectTotal: selectCreditLimitStoreTotal
} = adapterCreditLimitStore.getSelectors(getCreditLimitStoresState);
