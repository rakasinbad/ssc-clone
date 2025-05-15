import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

// -----------------------------------------------------------------------------------------------------
// Fetch Store Segment Alert
// -----------------------------------------------------------------------------------------------------

export const fetchStoreAlertRequest = createAction(
    '[Store Segmentation] Fetch Store Alert Request',
    props<{ payload: IQueryParams }>()
);

export const fetchStoreAlertFailure = createAction(
    '[Store Segmentation] Fetch Store Alert Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchStoreAlertSuccess = createAction(
    '[Store Segmentation] Fetch Store Alert Success',
    props<{ payload: { data: Array<any>; total: number } }>()
);

export const clearState = createAction('[Store Segmentation] Reset Store Alert Core State');

export type FailureActions = 'fetchStoreAlertFailure';
