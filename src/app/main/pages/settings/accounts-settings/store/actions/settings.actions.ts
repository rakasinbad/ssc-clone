import { createAction, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import {
    IErrorHandler,
    // IQueryParams,
    // TNullable,
    TSource
} from 'app/shared/models';
import {
    IUserResponseUpdatePassword,
    UpdateUser,
    User
} from '../../models';

/**
 *  ========================= USER
 */

/**
 * FETCH REQUEST
 */
export const fetchUserRequest = createAction(
    '[Users API] Fetch User Request',
    props<{ payload: string }>()
);

/**
 * FETCH FAILURE
 */
export const fetchUserFailure = createAction(
    '[User API] Fetch User Failure',
    props<{ payload: IErrorHandler }>()
);

/**
 * FETCH SUCCESS
 */
export const fetchUserSuccess = createAction(
    '[Users API] Fetch User Success',
    props<{ payload: { user?: User; source: TSource } }>()
);

/**
 * PATCH REQUEST
 */
export const patchUserRequest = createAction(
    '[Users API] Patch User Request',
    props<{ payload: { id: string; data: Partial<UpdateUser>; update: 'information' | 'password' } }>()
);

/**
 * PATCH FAILURE
 */
export const patchUserFailure = createAction(
    '[Users API] Patch User Failure',
    props<{ payload: IErrorHandler }>()
);

/**
 * PATCH SUCCESS
 */
export const patchUserSuccess = createAction(
    '[Users API] Patch User Success',
    props<{ payload: { user?: User; response?: IUserResponseUpdatePassword; } }>()
);

/**
 * UPDATE
 */
export const updateUser = createAction(
    '[Settings/User Page] Update User',
    props<{ payload: { user: Update<User> } }>()
);

/**
 * RESET
 */
export const resetUser = createAction('[Settings/User Page] Reset User Data');

/**
 * HELPER
 */
export const notifyError = createAction(
    '[Settings/User Page] Notify Error',
    props<{ payload: string }>()
);
