import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

import { StockManagementCatalogue } from '../../models';

// -----------------------------------------------------------------------------------------------------
// Fetch Stock Management Catalogues
// -----------------------------------------------------------------------------------------------------

export const fetchStockManagementCataloguesRequest = createAction(
    '[Stock Managements] Fetch Stock Management Catalogues Request',
    props<{ payload: { params: IQueryParams; warehouseId: string } }>()
);

export const fetchStockManagementCataloguesFailure = createAction(
    '[Stock Managements] Fetch Stock Management Catalogues Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchStockManagementCataloguesSuccess = createAction(
    '[Stock Managements] Fetch Stock Management Catalogues Success',
    props<{ payload: { data: Array<StockManagementCatalogue>; total: number } }>()
);

export const clearState = createAction(
    '[Stock Managements] Reset Stock Management Catalogues State'
);

export type FailureActions = 'fetchStockManagementCataloguesFailure';
