import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

import { PayloadStockManagementCatalogue, StockManagementCatalogue } from '../../models';

// -----------------------------------------------------------------------------------------------------
// [FETCH] Stock Management Catalogues
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

// -----------------------------------------------------------------------------------------------------
// [CRUD - UPDATE] Stock Management Catalogue
// -----------------------------------------------------------------------------------------------------

export const updateStockManagementCatalogueRequest = createAction(
    '[Stock Managements] Update Stock Management Catalogue Request',
    props<{ payload: PayloadStockManagementCatalogue }>()
);

export const updateStockManagementCatalogueFailure = createAction(
    '[Stock Managements] Update Stock Management Catalogue Failure',
    props<{ payload: ErrorHandler }>()
);

export const updateStockManagementCatalogueSuccess = createAction(
    '[Stock Managements] Update Stock Management Catalogue Success'
);

export const clearState = createAction(
    '[Stock Managements] Reset Stock Management Catalogues State'
);

export type FailureActions =
    | 'fetchStockManagementCataloguesFailure'
    | 'updateStockManagementCatalogueFailure';
