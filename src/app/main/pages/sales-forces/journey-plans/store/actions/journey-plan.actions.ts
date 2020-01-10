import { createAction, props } from '@ngrx/store';
import { ErrorHandler, IQueryParams } from 'app/shared/models';

import { JourneyPlan, ViewBy } from '../../models';

// -----------------------------------------------------------------------------------------------------
// Fetch Journey Plans
// -----------------------------------------------------------------------------------------------------

export const fetchJourneyPlansRequest = createAction(
    '[JPs API] Fetch Journey Plans Request',
    props<{ payload: IQueryParams }>()
);

export const fetchJourneyPlansFailure = createAction(
    '[JPs API] Fetch Journey Plans Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchJourneyPlansSuccess = createAction(
    '[JPs API] Fetch Journey Plans Success',
    props<{ payload: { data: Array<JourneyPlan>; total: number } }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - DELETE] Journey Plan
// -----------------------------------------------------------------------------------------------------

export const confirmDeleteJourneyPlan = createAction(
    '[JP API] Confirm Delete Journey Plan',
    props<{ payload: JourneyPlan }>()
);

export const deleteJourneyPlanRequest = createAction(
    '[JP API] Delete Journey Plan Request',
    props<{ payload: string }>()
);

export const deleteJourneyPlanFailure = createAction(
    '[JP API] Delete Journey Plan Failure',
    props<{ payload: ErrorHandler }>()
);

export const deleteJourneyPlanSuccess = createAction(
    '[JP API] Delete Journey Plan Success',
    props<{ payload: string }>()
);

// -----------------------------------------------------------------------------------------------------
// Filter View Journey Plans
// -----------------------------------------------------------------------------------------------------

export const setViewBy = createAction(
    '[JP Helper] Set View By',
    (viewBy: ViewBy = ViewBy.DATE) => ({
        payload: viewBy
    })
);

// -----------------------------------------------------------------------------------------------------
// EXPORT Journey Plan
// -----------------------------------------------------------------------------------------------------

export const exportRequest = createAction(
    '[JP Page] Export Request',
    props<{ payload: { dateGte?: string; dateLte?: string } }>()
);

export const exportFailure = createAction(
    '[JP Page] Export Failure',
    props<{ payload: ErrorHandler }>()
);

export const exportSuccess = createAction('[JP Page] Export Success', props<{ payload: string }>());

// -----------------------------------------------------------------------------------------------------
// IMPORT Journey Plan
// -----------------------------------------------------------------------------------------------------

export const importRequest = createAction(
    '[JP Page] Import Request',
    props<{ payload: { file: File; type: string } }>()
);

export const importFailure = createAction(
    '[JP Page] Import Failure',
    props<{ payload: ErrorHandler }>()
);

export const importSuccess = createAction('[JP Page] Import Success');

// -----------------------------------------------------------------------------------------------------
// Helper
// -----------------------------------------------------------------------------------------------------

export const clearState = createAction('[JP Helper] Clear State');

export const clearViewBy = createAction('[JP Helper] Clear View By');
