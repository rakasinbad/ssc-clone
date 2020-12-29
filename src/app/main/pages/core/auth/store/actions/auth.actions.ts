import { createAction, props } from '@ngrx/store';
import { IErrorHandler } from 'app/shared/models/global.model';

import { Auth } from '../../models';

export const authAutoLogin = createAction('[Auth Page] Auto Login');

export const authAutoLoginSuccess = createAction(
    '[Auth Page] Auto Login Success',
    props<{ payload: Auth }>()
);

export const authAutoLoginFailure = createAction('[Auth Page] Auto Login Failure');

export const authLoginRequest = createAction(
    '[Auth API] Login Request',
    props<{ payload: { username: string; password: string } }>()
);

export const authLoginFailure = createAction(
    '[Auth API] Login Failure',
    props<{ payload: IErrorHandler }>()
);

export const authLoginSuccess = createAction(
    '[Auth API] Login Success',
    props<{ payload: Auth }>()
);

export const authLogout = createAction('[Auth Page] Logout');
