import { createAction, props } from '@ngrx/store';
import { IErrorHandler, IQueryParams, TSource } from 'app/shared/models';

import { IInternalDemo, InternalEmployee, InternalEmployeeDetail } from '../../models';

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
    props<{ payload: { internalEmployees: InternalEmployee[]; total: number } }>()
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
    props<{ payload: { internalEmployee?: InternalEmployeeDetail; source: TSource } }>()
);

// -----------------------------------------------------------------------------------------------------
// CRUD Internal Employee Actions
// -----------------------------------------------------------------------------------------------------

export const updateInternalEmployeeRequest = createAction(
    '[Internal Employee API] Update Internal Employee Request',
    props<{ payload: { body: InternalEmployeeDetail; id: string } }>()
);

export const updateInternalEmployeeFailure = createAction(
    '[Internal Employee API] Update Internal Employee Failure',
    props<{ payload: IErrorHandler }>()
);

export const updateInternalEmployeeSuccess = createAction(
    '[Internal Employee API] Update Internal Employee Success',
    props<{ payload: InternalEmployeeDetail }>()
);

export const confirmDeleteInternalEmployee = createAction(
    '[Internal Employees Page] Confirm Delete Internal Employee',
    props<{ payload: InternalEmployee }>()
);

export const deleteInternalEmployeeRequest = createAction(
    '[Internal Employee API] Delete Internal Employee Request',
    props<{ payload: string }>()
);

export const deleteInternalEmployeeFailure = createAction(
    '[Internal Employee API] Delete Internal Employee Failure',
    props<{ payload: IErrorHandler }>()
);

export const deleteInternalEmployeeSuccess = createAction(
    '[Internal Employee API] Delete Internal Employee Success',
    props<{ payload: string }>()
);

export const confirmChangeStatusInternalEmployee = createAction(
    '[Internal Employees Page] Confirm Change Status Internal Employees',
    props<{ payload: InternalEmployee }>()
);

export const updateStatusInternalEmployeeRequest = createAction(
    '[Internal Employees API] Update Status Internal Employees Request',
    props<{ payload: { body: string; id: string } }>()
);

export const updateStatusInternalEmployeeFailure = createAction(
    '[Internal Employees API] Update Status Internal Employees Failure',
    props<{ payload: IErrorHandler }>()
);

export const updateStatusInternalEmployeeSuccess = createAction(
    '[Internal Employees API] Update Status Internal Employees Success'
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
