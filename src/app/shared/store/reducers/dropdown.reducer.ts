import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { Role } from 'app/main/pages/roles/role.model';
import * as DropdownActions from '../actions/dropdown.actions';
import { IErrorHandler } from 'app/shared/models';
import { Account } from 'app/main/pages/accounts/models';

export const FEATURE_KEY = 'dropdowns';

interface AccountState extends EntityState<Account> {}
interface ErrorState extends EntityState<IErrorHandler> {}

interface SearchState {
    accounts: AccountState | undefined;
}

export interface State {
    search: SearchState | undefined;
    roles: Role[] | undefined;
    errors: ErrorState;
}
const adapterAccount = createEntityAdapter<Account>();
const initialAccountState = adapterAccount.getInitialState();

const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

export const initialState: State = {
    search: {
        accounts: initialAccountState
    },
    roles: [],
    errors: initialErrorState
};

const dropdownReducer = createReducer(
    initialState,
    on(DropdownActions.fetchDropdownRoleSuccess, (state, { payload }) => ({
        ...state,
        roles: [...payload]
    })),
    on(DropdownActions.fetchSearchAccountSuccess, (state, { payload }) => ({
        ...state,
        search: {
            ...state.search,
            accounts: adapterAccount.addAll(payload, state.search.accounts)
        },
        errors: adapterError.removeOne('fetchAccountSearchFailure', state.errors)
    })),
    on(DropdownActions.fetchSearchAccountFailure, (state, { payload }) => ({
        ...state,
        errors: adapterError.upsertOne(payload, state.errors)
    }))
);

export function reducer(state: State | undefined, action: Action): State {
    return dropdownReducer(state, action);
}

const getListSearchAccountState = (state: State) => state.search.accounts;

export const {
    selectAll: selectAllSearchAccounts,
    selectEntities: selectSearchAccountEntities,
    selectIds: selectSearchAccountIds,
    selectTotal: selectSearchAccountsTotal
} = adapterAccount.getSelectors(getListSearchAccountState);
