import { createAction, props } from '@ngrx/store';
import { IErrorHandler, IQueryParams, TSource } from 'app/shared/models';

// import { StoreCatalogue } from '../../models';

/**
 * STORE CATALOGUE
 */

export const fetchStoreCatalogueRequest = createAction(
    '[Store Catalogues API] Fetch Store Catalogue Request',
    props<{ payload: IQueryParams }>()
);

export const fetchStoreCatalogueFailure = createAction(
    '[Store Catalogues API] Fetch Store Catalogue Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchStoreCatalogueSuccess = createAction(
    '[Store Catalogues API] Fetch Store Catalogues Success',
    props<{ payload: { storeCatalogue: any; source: TSource } }>()
);

/**
 * STORE CATALOGUES
 */

export const fetchStoreCataloguesRequest = createAction(
    '[Store Catalogues API] Fetch Store Catalogues Request',
    props<{ payload: IQueryParams }>()
);

export const fetchStoreCataloguesFailure = createAction(
    '[Store Catalogues API] Fetch Store Catalogues Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchStoreCataloguesSuccess = createAction(
    '[Attendances API] Fetch Store Catalogues Success',
    props<{ payload: { storeCatalogues: Array<any>; total: number } }>()
);
