import { createAction, props } from '@ngrx/store';
import { ErrorHandler, IQueryParams } from 'app/shared/models';

import { JourneyPlan } from '../../models';

// -----------------------------------------------------------------------------------------------------
// Fetch Journey Plans
// -----------------------------------------------------------------------------------------------------

export const fetchJourneyPlansRequest = createAction(
    '[Journey Plans API] Fetch Journey Plans Request',
    props<{ payload: IQueryParams }>()
);

export const fetchJourneyPlansFailure = createAction(
    '[Journey Plans API] Fetch Journey Plans Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchJourneyPlansSuccess = createAction(
    '[Journey Plans API] Fetch Journey Plans Success',
    props<{ payload: { data: Array<JourneyPlan>; total: number } }>()
);

// -----------------------------------------------------------------------------------------------------
// Helper
// -----------------------------------------------------------------------------------------------------

export const clearState = createAction('[Journey Plan Page] Clear State');
