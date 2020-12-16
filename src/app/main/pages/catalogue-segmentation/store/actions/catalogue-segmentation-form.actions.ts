import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { CreateCatalogueSegmentationDto, PatchCatalogueSegmentationDto } from '../../models';

enum Actions {
    CreateCatalogueSegmentationFailure = '[Catalogue Segmentation Form] Create Catalogue Segmentation Failure',
    CreateCatalogueSegmentationRequest = '[Catalogue Segmentation Form] Create Catalogue Segmentation Request',
    CreateCatalogueSegmentationSuccess = '[Catalogue Segmentation Form] Create Catalogue Segmentation Success',
    UpdateCatalogueSegmentationFailure = '[Catalogue Segmentation Form] Update Catalogue Segmentation Failure',
    UpdateCatalogueSegmentationRequest = '[Catalogue Segmentation Form] Update Catalogue Segmentation Request',
    UpdateCatalogueSegmentationSuccess = '[Catalogue Segmentation Form] Update Catalogue Segmentation Success',
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

export const updateCatalogueSegmentationRequest = createAction(
    Actions.UpdateCatalogueSegmentationRequest,
    props<{ payload: { body: PatchCatalogueSegmentationDto; id: string } }>()
);

export const updateCatalogueSegmentationSuccess = createAction(
    Actions.UpdateCatalogueSegmentationSuccess,
    props<{ message: string }>()
);

export const updateCatalogueSegmentationFailure = createAction(
    Actions.UpdateCatalogueSegmentationFailure,
    props<{ payload: ErrorHandler }>()
);

export type FailureActions =
    | 'createCatalogueSegmentationFailure'
    | 'updateCatalogueSegmentationFailure';
