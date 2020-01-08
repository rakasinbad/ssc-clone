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
// Filter View Journey Plans
// -----------------------------------------------------------------------------------------------------

export const setViewBy = createAction(
    '[JP Helper] Set View By',
    (viewBy: ViewBy = ViewBy.DATE) => ({
        payload: viewBy
    })
);

// -----------------------------------------------------------------------------------------------------
// Helper
// -----------------------------------------------------------------------------------------------------

export const clearState = createAction('[JP Helper] Clear State');

export const clearViewBy = createAction('[JP Helper] Clear View By');
