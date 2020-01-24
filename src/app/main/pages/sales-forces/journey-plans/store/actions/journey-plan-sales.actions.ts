import { createAction, props } from '@ngrx/store';

import { JourneyPlanSales } from '../../models';

// -----------------------------------------------------------------------------------------------------
// [CRUD - ADD, DELETE]
// -----------------------------------------------------------------------------------------------------

export const setJourneyPlanSales = createAction(
    '[JP Page] Set Journe Plan Sales',
    props<{ payload: Array<JourneyPlanSales> }>()
);

// -----------------------------------------------------------------------------------------------------
// Helper
// -----------------------------------------------------------------------------------------------------

export const clearState = createAction('[JP Helper] Clear State');
