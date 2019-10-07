import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler, TSource } from 'app/shared/models';
import * as fromRoot from 'app/store/app.reducer';

import { Account } from '../../models/account.model';
import { AccountActions } from '../actions';

export const FEATURE_KEY = 'accounts';

interface AccountState extends EntityState<Account> {
    total: number;
}

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
    isDeleting: boolean | undefined;
    isLoading: boolean;
    selectedAccountId: string | number;
    source: TSource;
    account: Account | undefined;
    accounts: AccountState;
    errors: ErrorState;
}

const adapterAccount: EntityAdapter<Account> = createEntityAdapter<Account>({
    selectId: account => account.id
});
const initialAccountState: AccountState = adapterAccount.getInitialState({
    total: 0
});

const adapterError: EntityAdapter<IErrorHandler> = createEntityAdapter<IErrorHandler>();
const initialErrorState: ErrorState = adapterError.getInitialState();

export const initialState: State = {
    isDeleting: undefined,
    isLoading: false,
    selectedAccountId: null,
    source: 'fetch',
    account: undefined,
    accounts: initialAccountState,
    errors: initialErrorState
};

const accountReducer = createReducer(
    initialState,
    on(
        AccountActions.createAccountRequest,
        AccountActions.updateAccountRequest,
        AccountActions.fetchAccountsRequest,
        state => ({
            ...state,
            isLoading: true
        })
    ),
    on(AccountActions.deleteAccountRequest, state => ({
        ...state,
        isLoading: true,
        isDeleting: false
    })),
    on(AccountActions.createAccountSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        accounts: adapterAccount.addOne(payload, {
            ...state.accounts,
            total: state.accounts.total + 1
        }),
        errors: adapterError.removeOne('createAccountFailure', state.errors)
    })),
    on(AccountActions.updateAccountSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        accounts: adapterAccount.updateOne(payload, state.accounts),
        errors: adapterError.removeOne('updateAccountFailure', state.errors)
    })),
    on(AccountActions.deleteAccountSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isDeleting: true,
        accounts: adapterAccount.removeOne(payload, state.accounts),
        errors: adapterError.removeOne('deleteAccountFailure', state.errors)
    })),
    on(AccountActions.fetchAccountsSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isDeleting: undefined,
        accounts: adapterAccount.addAll(payload.accounts, {
            ...state.accounts,
            total: payload.total
        }),
        errors: adapterError.removeOne('fetchAccountsFailure', state.errors)
    })),
    on(
        AccountActions.createAccountFailure,
        AccountActions.updateAccountFailure,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            errors: adapterError.upsertOne(payload, { ...state.errors })
        })
    ),
    on(AccountActions.deleteAccountFailure, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isDeleting: true,
        errors: adapterError.upsertOne(payload, { ...state.errors })
    })),
    on(AccountActions.fetchAccountsFailure, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isDeleting: undefined,
        errors: adapterError.upsertOne(payload, { ...state.errors })
    })),
    on(AccountActions.fetchAccountRequest, (state, { payload }) => ({
        ...state,
        selectedAccountId: payload
    })),
    on(AccountActions.fetchAccountSuccess, (state, { payload }) => {
        let stateNew = { ...state, source: payload.source };

        if (payload.source === 'fetch') {
            stateNew = {
                ...stateNew,
                account: payload.account,
                errors: adapterError.removeOne('fetchAccountFailure', state.errors)
            };
        } else {
            stateNew = {
                ...stateNew,
                account: undefined,
                errors: adapterError.removeOne('fetchAccountFailure', state.errors)
            };
        }

        console.groupCollapsed('[Reducer fetchAccountSuccess]');
        console.log(stateNew);
        console.groupEnd();

        return stateNew;
    })
);

export function reducer(state: State | undefined, action: Action): State {
    return accountReducer(state, action);
}

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

const getListAccountState = (state: State) => state.accounts;

export const {
    selectAll: selectAllAccounts,
    selectEntities: selectAccountEntities,
    selectIds: selectAccountIds,
    selectTotal: selectAccountsTotal
} = adapterAccount.getSelectors(getListAccountState);
