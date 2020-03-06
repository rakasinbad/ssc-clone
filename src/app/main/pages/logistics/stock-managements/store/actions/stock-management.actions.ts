import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

import { StockManagement } from './../../models';

// -----------------------------------------------------------------------------------------------------
// Fetch Stock Managments
// -----------------------------------------------------------------------------------------------------

export const fetchStockManagementsRequest = createAction(
    '[Stock Managements] Fetch Stock Managements Request',
    props<{ payload: IQueryParams }>()
);

export const fetchStockManagementsFailure = createAction(
    '[Stock Managements] Fetch Stock Managements Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchStockManagementsSuccess = createAction(
    '[Stock Managements] Fetch Stock Managements Success',
    props<{ payload: { data: Array<StockManagement>; total: number } }>()
);

export const clearState = createAction('[Stock Managements] Reset Core State');

export type FailureActions = 'fetchStockManagementsFailure';
