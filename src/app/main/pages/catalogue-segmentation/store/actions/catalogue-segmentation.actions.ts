import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

enum Actions {
    FetchCatalogueSegmentationsFailure = '[Catalogue Segmentation] Fetch Catalogue Segmentations Failure',
    FetchCatalogueSegmentationsRequest = '[Catalogue Segmentation] Fetch Catalogue Segmentations Request',
    FetchCatalogueSegmentationsSuccess = '[Catalogue Segmentation] Fetch Catalogue Segmentations Success',
}

export const fetchCatalogueSegmentationsRequest = createAction(
    Actions.FetchCatalogueSegmentationsRequest,
    props<{ payload: IQueryParams }>()
);

export const fetchCatalogueSegmentationsSuccess = createAction(
    Actions.FetchCatalogueSegmentationsSuccess,
    props<{ payload: any }>()
);

export const fetchCatalogueSegmentationsFailure = createAction(
    Actions.FetchCatalogueSegmentationsFailure,
    props<{ payload: ErrorHandler }>()
);

export type FailureActions = 'fetchCatalogueSegmentationsFailure';
