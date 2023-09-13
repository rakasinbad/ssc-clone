import { createAction, props } from '@ngrx/store';
import { IQueryParams } from 'app/shared/models/query.model';
import { IErrorHandler } from 'app/shared/models/global.model';
import { WarehouseCatalogue } from '../../models/warehouse-catalogue.model';

export type requestActionNames = 'fetchWarehouseCataloguesRequest';

export type failureActionNames = 'fetchWarehouseCataloguesFailure';

/**
 * FETCH DATA
 */

export const fetchWarehouseCataloguesRequest = createAction(
    '[Warehouse/SKU Assignment/Warehouse Catalogue API] Fetch Warehouse Catalogues Request',
    props<{ payload: IQueryParams }>()
);

export const fetchWarehouseCataloguesFailure = createAction(
    '[Warehouse/SKU Assignment/Warehouse Catalogue API] Fetch Warehouse Catalogues Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchWarehouseCataloguesSuccess = createAction(
    '[Warehouse/SKU Assignment/Warehouse Catalogue API] Fetch Warehouse Catalogues Success',
    props<{ payload: { data: Array<WarehouseCatalogue>; total: number } }>()
);

/**
 * RESET
 */
export const resetWarehouseCatalogue = createAction(
    '[Warehouse/SKU Assignment/Warehouse Catalogue] Reset Warehouse Catalogue State'
);

export const setSearchValue = createAction(
    '[SkuAssignmentsWarehouse PAGE] Set Search Value',
    props<{ payload: string }>()
);
