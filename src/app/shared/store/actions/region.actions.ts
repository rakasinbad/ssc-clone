import { createAction, props } from '@ngrx/store';
import { Region } from 'app/shared/models/region.model';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParamsRegion } from 'app/shared/models/region.model';

// -----------------------------------------------------------------------------------------------------
// Fetch [Region]
// -----------------------------------------------------------------------------------------------------

export const fetchRegionRequest = createAction(
    '[Helper Sources - Region API] Fetch Region Request',
    props<{ payload: IQueryParamsRegion }>()
);

export const fetchRegionFailure = createAction(
    '[Helper Sources - Region API] Fetch Region Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchRegionSuccess = createAction(
    '[Helper Sources - Region API] Fetch Region Success',
    props<{ payload: Array<Region>, total: number }>()
);

// -----------------------------------------------------------------------------------------------------
// Helper Actions
// -----------------------------------------------------------------------------------------------------

export const clearRegionState = createAction(
    '[Helper Sources - Region] Clear Region State'
);

export type FailureActions = 'fetchRegionFailure';
