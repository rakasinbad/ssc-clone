import { createAction, props } from '@ngrx/store';
import { IErrorHandler, TSource } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { User } from 'app/shared/models/user.model';

/**
 * USER
 */

export const fetchUserRequest = createAction(
    '[Attendances API] Fetch User Request',
    props<{ payload: string }>()
);

export const fetchUserFailure = createAction(
    '[Attendances API] Fetch User Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchUserSuccess = createAction(
    '[Attendances API] Fetch User Success',
    props<{ payload: { user?: User; source: TSource } }>()
);

export const setSelectedUser = createAction(
    '[Attendances Page] Set Selected User',
    props<{ payload: User }>()
);

export const resetSelectedUser = createAction('[Attendances Page] Reset Selected User');

/**
 * STORES
 */

export const fetchUsersRequest = createAction(
    '[Attendances API] Fetch Users Request',
    props<{ payload: IQueryParams }>()
);

export const fetchUsersFailure = createAction(
    '[Attendances API] Fetch Users Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchUsersSuccess = createAction(
    '[Attendances API] Fetch Users Success',
    props<{ payload: { users?: Array<User>; total: number; source: TSource } }>()
);
