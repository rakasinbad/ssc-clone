import { createAction, props } from '@ngrx/store';
import { Brand } from 'app/shared/models/brand.model';
import { IErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

/**
 * BRANDS
 */

export const fetchBrandsRequest = createAction(
    '[Catalogues API] Fetch Brands Request',
    props<{ payload: IQueryParams }>()
);

export const fetchBrandsFailure = createAction(
    '[Catalogues API] Fetch Brands Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchBrandsSuccess = createAction(
    '[Catalogues API] Fetch Brands Success',
    props<{ payload: { brands: Array<Brand>; total: number } }>()
);
