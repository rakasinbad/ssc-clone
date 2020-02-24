import { createAction, props } from '@ngrx/store';
import { IQueryParams, ErrorHandler } from 'app/shared/models';

export const fetchStockManagementsRequest = createAction(
    '[StockManagements] Fetch StockManagements Request',
    props<{ payload: IQueryParams }>()
);

export const fetchStockManagementsFailure = createAction(
    '[StockManagements] Fetch StockManagements Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchStockManagementsSuccess = createAction(
    '[StockManagements] Fetch StockManagements Success',
    props<{ payload: { data: any; total: number } }>()
);
