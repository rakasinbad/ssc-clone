import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

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
