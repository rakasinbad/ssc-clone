import { createAction, props } from '@ngrx/store';
import { IErrorHandler, IQueryParams, TSource } from 'app/shared/models';

import { Brand } from '../../models';


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
