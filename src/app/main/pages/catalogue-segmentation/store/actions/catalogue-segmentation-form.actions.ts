import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { CreateCatalogueSegmentationDto } from '../../models';

enum Actions {
    CreateCatalogueSegmentationFailure = '[Catalogue Segmentation Form] Create Catalogue Segmentation Failure',
    CreateCatalogueSegmentationRequest = '[Catalogue Segmentation Form] Create Catalogue Segmentation Request',
    CreateCatalogueSegmentationSuccess = '[Catalogue Segmentation Form] Create Catalogue Segmentation Success',
}

export const createCatalogueSegmentationRequest = createAction(
    Actions.CreateCatalogueSegmentationRequest,
    props<{ payload: CreateCatalogueSegmentationDto }>()
);

export const createCatalogueSegmentationSuccess = createAction(
    Actions.CreateCatalogueSegmentationSuccess,
    props<{ message: string }>()
);

export const createCatalogueSegmentationFailure = createAction(
    Actions.CreateCatalogueSegmentationFailure,
    props<{ payload: ErrorHandler }>()
);

export type FailureActions = 'createCatalogueSegmentationFailure';
