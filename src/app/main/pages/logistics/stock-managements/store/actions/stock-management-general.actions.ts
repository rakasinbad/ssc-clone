import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

import { StockManagementCatalogue } from '../../models';

// -----------------------------------------------------------------------------------------------------
// Fetch Stock Management Generals
// -----------------------------------------------------------------------------------------------------

export const fetchStockManagementGeneralsRequest = createAction(
    '[Stock Management Generals] Fetch Stock Management Generals Request',
    props<{ payload: { params: IQueryParams; warehouseId: string } }>()
);

export const fetchStockManagementGeneralsFailure = createAction(
    '[Stock Management Generals] Fetch Stock Management Generals Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchStockManagementGeneralsSuccess = createAction(
    '[Stock Management Generals] Fetch Stock Management Generals Success',
    props<{ payload: { data: Array<StockManagementCatalogue>; total: number } }>()
);

export const clearState = createAction('[Stock Management Generals] Reset Core State');

export type FailureActions = 'fetchStockManagementGeneralsFailure';
