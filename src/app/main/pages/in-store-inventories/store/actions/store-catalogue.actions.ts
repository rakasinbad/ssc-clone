import { createAction, props } from '@ngrx/store';
import { IErrorHandler, IQueryParams, TSource } from 'app/shared/models';

// import { StoreCatalogue } from '../../models';

/**
 * STORE CATALOGUE
 */

export const fetchStoreCatalogueRequest = createAction(
    '[Store Catalogues API] Fetch Store Catalogue Request',
    props<{ payload: string }>()
);

export const fetchStoreCatalogueFailure = createAction(
    '[Store Catalogues API] Fetch Store Catalogue Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchStoreCatalogueSuccess = createAction(
    '[Store Catalogues API] Fetch Store Catalogue Success',
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

/**
 * STORE CATALOGUE HISTORIES
 */

export const fetchStoreCatalogueHistoriesRequest = createAction(
    '[Store Catalogues API] Fetch Store Catalogue Histories Request',
    props<{ payload: IQueryParams }>()
);

export const fetchStoreCatalogueHistoriesFailure = createAction(
    '[Store Catalogues API] Fetch Store Catalogue Histories Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchStoreCatalogueHistoriesSuccess = createAction(
    '[Store Catalogues API] Fetch Store Catalogue Histories Success',
    props<{ payload: { catalogueHistories: Array<any>; total: number } }>()
);