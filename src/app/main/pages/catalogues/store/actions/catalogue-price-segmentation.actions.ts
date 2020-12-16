import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';

enum Actions {
    DeleteFailure = '[Catalogue] Delete Price Segmentation Failure',
    DeleteRequest = '[Catalogue] Delete Price Segmentation Request',
    DeleteSuccess = '[Catalogue] Delete Price Segmentation Success',
}

export const deleteRequest = createAction(
    Actions.DeleteRequest,
    props<{ id: string; formIndex?: number }>()
);

export const deleteSuccess = createAction(
    Actions.DeleteSuccess,
    props<{ id: string; formIndex: number }>()
);

export const deleteFailure = createAction(
    Actions.DeleteFailure,
    props<{ payload: ErrorHandler }>()
);

export type FailureActions = 'deleteFailure';
