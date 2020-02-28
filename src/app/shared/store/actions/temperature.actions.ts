import { createAction, props } from '@ngrx/store';
import { ErrorHandler, IQueryParams, Temperature } from 'app/shared/models';

// -----------------------------------------------------------------------------------------------------
// Fetch [Temperature]
// -----------------------------------------------------------------------------------------------------

export const fetchTemperatureRequest = createAction(
    '[Helper Sources - Temperature API] Fetch Temperature Request',
    props<{ payload: IQueryParams }>()
);

export const fetchTemperatureFailure = createAction(
    '[Helper Sources - Temperature API] Fetch Temperature Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchTemperatureSuccess = createAction(
    '[Helper Sources - Temperature API] Fetch Temperature Success',
    props<{ payload: Array<Temperature> }>()
);

// -----------------------------------------------------------------------------------------------------
// Helper Actions
// -----------------------------------------------------------------------------------------------------

export const clearTemperatureState = createAction(
    '[Helper Sources - Temperature] Clear Temperature State'
);

export type FailureActions = 'fetchTemperatureFailure';
