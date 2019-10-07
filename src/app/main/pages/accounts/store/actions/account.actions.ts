import { Update } from '@ngrx/entity';
import { createAction, props } from '@ngrx/store';
import { IErrorHandler, TSource } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

import { Account } from '../../models/account.model';

export const fetchAccountsRequest = createAction(
    '[Accounts API] Fetch Accounts Request',
    props<{ payload: IQueryParams }>()
);

export const fetchAccountsFailure = createAction(
    '[Accounts API] Fetch Accounts Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchAccountsSuccess = createAction(
    '[Accounts API] Fetch Accounts Success',
    props<{ payload: { accounts: Account[]; total: number } }>()
);

export const fetchAccountRequest = createAction(
    '[Accounts API] Fetch Account Request',
    props<{ payload: string }>()
);

export const fetchAccountFailure = createAction(
    '[Accounts API] Fetch Account Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchAccountSuccess = createAction(
    '[Accounts API] Fetch Account Success',
    props<{
        payload: {
            account?: Account;
            source: TSource;
        };
    }>()
);

export const createAccountRequest = createAction(
    '[Accounts API] Create Account Request',
    props<{ payload: Account }>()
);

export const createAccountFailure = createAction(
    '[Accounts API] Create Account Failure',
    props<{ payload: IErrorHandler }>()
);

export const createAccountSuccess = createAction(
    '[Accounts API] Create Account Success',
    props<{ payload: Account }>()
);

export const updateAccountRequest = createAction(
    '[Accounts API] Update Account Request',
    props<{ payload: { body: Account; id: string } }>()
);

export const updateAccountFailure = createAction(
    '[Accounts API] Update Account Failure',
    props<{ payload: IErrorHandler }>()
);

export const updateAccountSuccess = createAction(
    '[Accounts API] Update Account Success',
    props<{ payload: Update<Account> }>()
);

export const deleteAccountRequest = createAction(
    '[Accounts API] Delete Account Request',
    props<{ payload: string }>()
);

export const deleteAccountSuccess = createAction(
    '[Accounts API] Delete Account Success',
    props<{ payload: string }>()
);

export const deleteAccountFailure = createAction(
    '[Accounts API] Delete Account Failure',
    props<{ payload: IErrorHandler }>()
);
