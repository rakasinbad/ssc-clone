import { Update } from '@ngrx/entity';
import { createAction, props } from '@ngrx/store';
import { IErrorHandler, IQueryParams, TStatus, User, UserSupplier } from 'app/shared/models';

import { IInternalDemo } from '../../models';

// -----------------------------------------------------------------------------------------------------
// Fetch Internal Employees
// -----------------------------------------------------------------------------------------------------

export const fetchInternalEmployeesRequest = createAction(
    '[Internal Employees API] Fetch Internal Employees Request',
    props<{ payload: IQueryParams }>()
);

export const fetchInternalEmployeesFailure = createAction(
    '[Internal Employees API] Fetch Internal Employees Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchInternalEmployeesSuccess = createAction(
    '[Internal Employees API] Fetch Internal Employees Success',
    props<{ payload: { data: UserSupplier[]; total: number } }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Internal Employee
// -----------------------------------------------------------------------------------------------------

export const fetchInternalEmployeeRequest = createAction(
    '[Internal Employee API] Fetch Internal Employee Request',
    props<{ payload: string }>()
);

export const fetchInternalEmployeeFailure = createAction(
    '[Internal Employee API] Fetch Internal Employee Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchInternalEmployeeSuccess = createAction(
    '[Internal Employee API] Fetch Internal Employee Success',
    props<{ payload: User }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - CREATE EMPLOYEE] Internal Employees
// -----------------------------------------------------------------------------------------------------

export const createInternalEmployeeRequest = createAction(
    '[Internal Employees API] Create Internal Employee Request',
    props<{
        payload: {
            fullName: string;
            roles: number[];
            mobilePhoneNo: string;
            email?: string;
            supplierId: string;
        };
    }>()
);

export const createInternalEmployeeFailure = createAction(
    '[Internal Employees API] Create Internal Employee Failure',
    props<{ payload: IErrorHandler }>()
);

export const createInternalEmployeeSuccess = createAction(
    '[Internal Employees API] Create Internal Employee Success',
    props<{ payload: UserSupplier }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - UPDATE EMPLOYEE] Internal Employees
// -----------------------------------------------------------------------------------------------------

export const updateInternalEmployeeRequest = createAction(
    '[Internal Employees API] Update Internal Employee Request',
    props<{
        payload: {
            body: {
                fullName?: string;
                roles?: number[];
                mobilePhoneNo?: string;
                email?: string;
            };
            id: string;
        };
    }>()
);

export const updateInternalEmployeeFailure = createAction(
    '[Internal Employees API] Update Internal Employee Failure',
    props<{ payload: IErrorHandler }>()
);

export const updateInternalEmployeeSuccess = createAction(
    '[Internal Employees API] Update Internal Employee Success',
    props<{ payload: User }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - DELETE EMPLOYEE] Internal Employees
// -----------------------------------------------------------------------------------------------------

export const confirmDeleteInternalEmployee = createAction(
    '[Internal Employees Page] Confirm Delete Internal Employee',
    props<{ payload: UserSupplier }>()
);

export const deleteInternalEmployeeRequest = createAction(
    '[Internal Employees API] Delete Internal Employee Request',
    props<{ payload: string }>()
);

export const deleteInternalEmployeeFailure = createAction(
    '[Internal Employees API] Delete Internal Employee Failure',
    props<{ payload: IErrorHandler }>()
);

export const deleteInternalEmployeeSuccess = createAction(
    '[Internal Employees API] Delete Internal Employee Success',
    props<{ payload: string }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - CHANGE STATUS EMPLOYEE] Internal Employees
// -----------------------------------------------------------------------------------------------------

export const confirmChangeStatusInternalEmployee = createAction(
    '[Internal Employees Page] Confirm Change Status Internal Employee',
    props<{ payload: UserSupplier }>()
);

export const updateStatusInternalEmployeeRequest = createAction(
    '[Internal Employees API] Update Status Internal Employee Request',
    props<{ payload: { body: TStatus; id: string } }>()
);

export const updateStatusInternalEmployeeFailure = createAction(
    '[Internal Employees API] Update Status Internal Employee Failure',
    props<{ payload: IErrorHandler }>()
);

export const updateStatusInternalEmployeeSuccess = createAction(
    '[Internal Employees API] Update Status Internal Employee Success',
    props<{ payload: Update<UserSupplier> }>()
);

// -----------------------------------------------------------------------------------------------------
// Reset Actions
// -----------------------------------------------------------------------------------------------------

export const resetInternalEmployees = createAction(
    '[Internal Employees Page] Reset Internal Employees State'
);

export const resetInternalEmployee = createAction(
    '[Internal Employee Page] Reset Internal Employee State'
);

// -----------------------------------------------------------------------------------------------------
// For Demo
// -----------------------------------------------------------------------------------------------------

export const generateInternalDemo = createAction(
    '[Internal Page] Generate Internal Demo',
    props<{ payload: IInternalDemo[] }>()
);

export const getInternalDemoDetail = createAction(
    '[Internal Page] Get Internal Demo Detail',
    props<{ payload: string }>()
);
