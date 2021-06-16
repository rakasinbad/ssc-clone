import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { AssignCatalogueDto, CreateCatalogueSegmentationDto, PatchCatalogueSegmentationDto, PatchCatalogueSegmentationInfoDto } from '../../models';

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
    AssignCatalogueFailure = '[Catalogue Segmentation Form] Assign Catalogue Failure',
    AssignCatalogueRequest = '[Catalogue Segmentation Form] Assign Catalogue Request',
    AssignCatalogueSuccess = '[Catalogue Segmentation Form] Assign Catalogue Success',
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

export const assignCatalogueRequest = createAction(
    Actions.AssignCatalogueRequest,
    props<{ payload: { body: AssignCatalogueDto; id: string } }>()
);

export const assignCatalogueSuccess = createAction(
    Actions.AssignCatalogueSuccess,
    props<{ message: string }>()
);

export const assignCatalogueFailure = createAction(
    Actions.AssignCatalogueFailure,
    props<{ payload: ErrorHandler }>()
);

export type FailureActions =
    | 'createCatalogueSegmentationFailure'
    | 'updateCatalogueSegmentationFailure'
    | 'updateCatalogueSegmentationInfoFailure'
    | 'assignCatalogueFailure';
