import { createAction, props } from '@ngrx/store';
import { FormMode } from 'app/shared/models';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { AvailableCatalogue } from '../../models';

enum Actions {
    FetchAvailableCataloguesFailure = '[Catalogue Segmentation] Fetch Available Catalogues Failure',
    FetchAvailableCataloguesRequest = '[Catalogue Segmentation] Fetch Available Catalogues Request',
    FetchAvailableCataloguesSuccess = '[Catalogue Segmentation] Fetch Available Catalogues Success',
    ResetState = '[Catalogue Segmentation] Reset Available Catalogue Data',
}

export const fetchAvailableCataloguesRequest = createAction(
    Actions.FetchAvailableCataloguesRequest,
    props<{ payload: { params: IQueryParams; formMode?: FormMode; id?: string } }>()
);

export const fetchAvailableCataloguesSuccess = createAction(
    Actions.FetchAvailableCataloguesSuccess,
    props<{ data: AvailableCatalogue[]; total: number }>()
);

export const fetchAvailableCataloguesFailure = createAction(
    Actions.FetchAvailableCataloguesFailure,
    props<{ payload: ErrorHandler }>()
);

export const resetState = createAction(Actions.ResetState);

export type FailureActions = 'fetchAvailableCataloguesFailure';
