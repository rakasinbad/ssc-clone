import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

import { StorePortfolio } from '../../models';

// -----------------------------------------------------------------------------------------------------
// Fetch Journey Plan Stores
// -----------------------------------------------------------------------------------------------------

export const fetchJourneyPlanStoresRequest = createAction(
    '[JP Stores API] Fetch JP Stores Request',
    props<{ payload: IQueryParams }>()
);

export const fetchJourneyPlanStoresFailure = createAction(
    '[JP Stores API] Fetch JP Stores Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchJourneyPlanStoresSuccess = createAction(
    '[JP Stores API] Fetch JP Stores Success',
    props<{ payload: { data: Array<StorePortfolio>; total: number } }>()
);

export const setFilterStore = createAction(
    '[JP Store Page] Set Filter Store',
    props<{ payload: string }>()
);

export const setInvoiceGroupId = createAction(
    '[JP Store Page] Set Invoice Group Id',
    props<{ payload: string }>()
);

// -----------------------------------------------------------------------------------------------------
// Helper
// -----------------------------------------------------------------------------------------------------

export const clearState = createAction('[JP Store Page] Clear State');

export const clearStoreState = createAction('[JP Store Page] Clear Store State');

export const clearInvoiceGroupIdState = createAction(
    '[JP Store Page] Clear Invoice Group Id State'
);
