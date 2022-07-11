import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

import { StockManagementHistory } from '../../models';

// -----------------------------------------------------------------------------------------------------
// Fetch Stock Management Histories
// -----------------------------------------------------------------------------------------------------

export const fetchStockManagementHistoriesRequest = createAction(
    '[Stock Management Histories] Fetch Stock Management Histories Request',
    props<{ payload: { params: IQueryParams; warehouseId: string } }>()
);

export const fetchStockManagementHistoriesFailure = createAction(
    '[Stock Management Histories] Fetch Stock Management Histories Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchStockManagementHistoriesSuccess = createAction(
    '[Stock Management Histories] Fetch Stock Management Histories Success',
    props<{ payload: { data: Array<StockManagementHistory>; total: number } }>()
);

export const clearState = createAction('[Stock Management Histories] Reset Core State');

export type FailureActions = 'fetchStockManagementHistoriesFailure';
