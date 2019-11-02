import { createAction, props } from '@ngrx/store';
import { IErrorHandler, IQueryParams } from 'app/shared/models';

import { IInternalDemo, InternalEmployee } from '../../models';

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
