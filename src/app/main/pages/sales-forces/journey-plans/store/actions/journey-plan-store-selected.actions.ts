import { createAction, props } from '@ngrx/store';

import { StorePortfolio } from '../../models';

// -----------------------------------------------------------------------------------------------------
// [CRUD - ADD, DELETE]
// -----------------------------------------------------------------------------------------------------

export const addSelectedStores = createAction(
    '[JP Store Page] Add Selected Stores',
    props<{ payload: StorePortfolio }>()
);

export const deleteSelectedStores = createAction(
    '[JP Store Page] Delete Selected Stores',
    props<{ payload: string }>()
);

export const confirmClearAllSelectedStores = createAction(
    '[JP Page] Confirm Clear All Selected Stores',
    props<{ payload: Array<string> }>()
);

// -----------------------------------------------------------------------------------------------------
// Helper
// -----------------------------------------------------------------------------------------------------

export const clearSelectedStores = createAction('[JP Store Page] Clear Selected Stores');
