import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { Catalogue } from '../../models';

enum Actions {
    FetchCataloguesFailure = '[Catalogue Segmentation] Fetch Catalogues Failure',
    FetchCataloguesRequest = '[Catalogue Segmentation] Fetch Catalogues Request',
    FetchCataloguesSuccess = '[Catalogue Segmentation] Fetch Catalogues Success',
}

export const fetchCataloguesRequest = createAction(
    Actions.FetchCataloguesRequest,
    props<{ payload: IQueryParams }>()
);

export const fetchCataloguesSuccess = createAction(
    Actions.FetchCataloguesSuccess,
    props<{ data: Catalogue[]; total: number }>()
);

export const fetchCataloguesFailure = createAction(
    Actions.FetchCataloguesFailure,
    props<{ payload: ErrorHandler }>()
);

export type FailureActions = 'fetchCataloguesFailure';
