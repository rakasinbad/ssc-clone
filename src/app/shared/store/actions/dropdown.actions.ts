import { createAction, props } from '@ngrx/store';
import { Account } from 'app/main/pages/accounts/models';
import { Role } from 'app/main/pages/roles/role.model';
import { IErrorHandler, IQueryParams } from 'app/shared/models';

export const fetchDropdownRoleRequest = createAction('[Helper Dropdown] Fetch Role Request');

export const fetchDropdownRoleFailure = createAction(
    '[Helper Dropdown] Fetch Role Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchDropdownRoleSuccess = createAction(
    '[Helper Dropdown] Fetch Role Success',
    props<{ payload: Role[] }>()
);

export const fetchSearchAccountRequest = createAction(
    '[Helper Search] Fetch Account Request',
    props<{ payload: IQueryParams }>()
);

export const fetchSearchAccountFailure = createAction(
    '[Helper Search] Fetch Account Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchSearchAccountSuccess = createAction(
    '[Helper Search] Fetch Account Success',
    props<{ payload: Account[] }>()
);
