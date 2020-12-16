import { createAction, props } from '@ngrx/store';
import { FormMode } from 'app/shared/models';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { Catalogue } from '../../models';

enum Actions {
    FetchCataloguesFailure = '[Catalogue Segmentation] Fetch Catalogues Failure',
    FetchCataloguesRequest = '[Catalogue Segmentation] Fetch Catalogues Request',
    FetchCataloguesSuccess = '[Catalogue Segmentation] Fetch Catalogues Success',
    ResetState = '[Catalogue Segmentation] Reset Catalogue Data',
}

export const fetchCataloguesRequest = createAction(
    Actions.FetchCataloguesRequest,
    props<{ payload: { params: IQueryParams; formMode?: FormMode; id?: string } }>()
);

export const fetchCataloguesSuccess = createAction(
    Actions.FetchCataloguesSuccess,
    props<{ data: Catalogue[]; total: number }>()
);

export const fetchCataloguesFailure = createAction(
    Actions.FetchCataloguesFailure,
    props<{ payload: ErrorHandler }>()
);

export const resetState = createAction(Actions.ResetState);

export type FailureActions = 'fetchCataloguesFailure';
