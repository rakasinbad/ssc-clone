import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { StockManagementReason } from 'app/shared/models/stock-management-reason.model';

// -----------------------------------------------------------------------------------------------------
// Fetch [Stock Management Reason]
// -----------------------------------------------------------------------------------------------------

export const fetchStockManagementReasonRequest = createAction(
    '[Helper Sources - Stock Management Reason API] Fetch Stock Management Reason Request',
    props<{ payload: { params: IQueryParams; method: string } }>()
);

export const fetchStockManagementReasonFailure = createAction(
    '[Helper Sources - Stock Management Reason API] Fetch Stock Management Reason Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchStockManagementReasonSuccess = createAction(
    '[Helper Sources - Stock Management Reason API] Fetch Stock Management Reason Success',
    props<{ payload: Array<StockManagementReason> }>()
);

// -----------------------------------------------------------------------------------------------------
// Helper Actions
// -----------------------------------------------------------------------------------------------------

export const clearStockManagementReasonState = createAction(
    '[Helper Sources - Stock Management Reason] Clear Stock Management Reason State'
);

export type FailureActions = 'fetchStockManagementReasonFailure';
