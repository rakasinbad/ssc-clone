import { Update } from '@ngrx/entity';
import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { CataloguePrice, MaxOrderQtySegmentationDto } from '../../models';

enum Actions {
    UpdateFailure = '[Catalogue] Update Max Order Qty Segmentation Failure',
    UpdateRequest = '[Catalogue] Update Max Order Qty Segmentation Request',
    UpdateSuccess = '[Catalogue] Update Max Order Qty Segmentation Success',
}

export const updateRequest = createAction(
    Actions.UpdateRequest,
    props<{ payload: MaxOrderQtySegmentationDto; formIndex?: number }>()
);

export const updateSuccess = createAction(
    Actions.UpdateSuccess,
    props<{ data: Update<CataloguePrice>; formIndex?: number }>()
);

export const updateFailure = createAction(
    Actions.UpdateFailure,
    props<{ payload: ErrorHandler }>()
);

export type FailureActions = 'updateFailure';
