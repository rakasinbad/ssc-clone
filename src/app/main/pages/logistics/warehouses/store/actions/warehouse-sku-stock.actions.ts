import { createAction, props } from '@ngrx/store';
import { ErrorHandler, IQueryParams, WarehouseCatalogue } from 'app/shared/models';

// -----------------------------------------------------------------------------------------------------
// Fetch Warehouse Sku Stocks
// -----------------------------------------------------------------------------------------------------

export const fetchWarehouseSkuStocksRequest = createAction(
    '[Warehouse Sku Stocks] Fetch Warehouse Sku Stocks Request',
    props<{ payload: { params: IQueryParams; warehouseId: string } }>()
);

export const fetchWarehouseSkuStocksFailure = createAction(
    '[Warehouse Sku Stocks] Fetch Warehouse Sku Stocks Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchWarehouseSkuStocksSuccess = createAction(
    '[Warehouse Sku Stocks] Fetch Warehouse Sku Stocks Success',
    props<{ payload: { data: Array<WarehouseCatalogue>; total: number } }>()
);

export const clearState = createAction('[Warehouse Sku Stocks] Reset Core State');

export type FailureActions = 'fetchWarehouseSkuStocksFailure';
