import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { Temperature } from 'app/shared/models/temperature.model';

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
