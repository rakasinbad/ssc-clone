import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { CreateCatalogueSegmentationDto, PatchCatalogueSegmentationDto, PatchCatalogueSegmentationInfoDto } from '../../models';

enum Actions {
    CreateCatalogueSegmentationFailure = '[Catalogue Segmentation Form] Create Catalogue Segmentation Failure',
    CreateCatalogueSegmentationRequest = '[Catalogue Segmentation Form] Create Catalogue Segmentation Request',
    CreateCatalogueSegmentationSuccess = '[Catalogue Segmentation Form] Create Catalogue Segmentation Success',
    UpdateCatalogueSegmentationFailure = '[Catalogue Segmentation Form] Update Catalogue Segmentation Failure',
    UpdateCatalogueSegmentationRequest = '[Catalogue Segmentation Form] Update Catalogue Segmentation Request',
    UpdateCatalogueSegmentationSuccess = '[Catalogue Segmentation Form] Update Catalogue Segmentation Success',
    UpdateCatalogueSegmentationInfoFailure = '[Catalogue Segmentation Form] Update Catalogue Segmentation Info Failure',
    UpdateCatalogueSegmentationInfoRequest = '[Catalogue Segmentation Form] Update Catalogue Segmentation Info Request',
    UpdateCatalogueSegmentationInfoSuccess = '[Catalogue Segmentation Form] Update Catalogue Segmentation Info Success',
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

export const updateCatalogueSegmentationInfoRequest = createAction(
    Actions.UpdateCatalogueSegmentationInfoRequest,
    props<{ payload: { body: PatchCatalogueSegmentationInfoDto; id: string } }>()
);

export const updateCatalogueSegmentationInfoSuccess = createAction(
    Actions.UpdateCatalogueSegmentationInfoSuccess,
    props<{ message: string }>()
);

export const updateCatalogueSegmentationInfoFailure = createAction(
    Actions.UpdateCatalogueSegmentationInfoFailure,
    props<{ payload: ErrorHandler }>()
);

export type FailureActions =
    | 'createCatalogueSegmentationFailure'
    | 'updateCatalogueSegmentationFailure'
    | 'updateCatalogueSegmentationInfoFailure';
