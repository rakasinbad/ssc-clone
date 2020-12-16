import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { CatalogueSegmentation } from '../../models';

enum Actions {
    FetchCatalogueSegmentationFailure = '[Catalogue Segmentation Detail] Fetch Catalogue Segmentation Failure',
    FetchCatalogueSegmentationRequest = '[Catalogue Segmentation Detail] Fetch Catalogue Segmentation Request',
    FetchCatalogueSegmentationSuccess = '[Catalogue Segmentation Detail] Fetch Catalogue Segmentation Success',
}

export const fetchCatalogueSegmentationRequest = createAction(
    Actions.FetchCatalogueSegmentationRequest,
    props<{ id: string }>()
);

export const fetchCatalogueSegmentationSuccess = createAction(
    Actions.FetchCatalogueSegmentationSuccess,
    props<{ data: CatalogueSegmentation }>()
);

export const fetchCatalogueSegmentationFailure = createAction(
    Actions.FetchCatalogueSegmentationFailure,
    props<{ payload: ErrorHandler }>()
);

export type FailureActions = 'fetchCatalogueSegmentationFailure';
