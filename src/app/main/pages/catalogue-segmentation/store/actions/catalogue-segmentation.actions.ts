import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { CatalogueSegmentation } from '../../models';

enum Actions {
    FetchCatalogueSegmentationsFailure = '[Catalogue Segmentation] Fetch Catalogue Segmentations Failure',
    FetchCatalogueSegmentationsRequest = '[Catalogue Segmentation] Fetch Catalogue Segmentations Request',
    FetchCatalogueSegmentationsSuccess = '[Catalogue Segmentation] Fetch Catalogue Segmentations Success',
    DeleteCatalogueSegmentationsSuccess = '[Catalogue Segmentation] Delete Catalogue Segmentations Success',
    RefreshTable = '[Catalogue Segmentation] Refresh Table Catalogue Segmentations Success',
    ResetState = '[Catalogue Segmentation] Reset Catalogue Segmentation Data',
}

export const fetchCatalogueSegmentationsRequest = createAction(
    Actions.FetchCatalogueSegmentationsRequest,
    props<{ payload: IQueryParams }>()
);

export const fetchCatalogueSegmentationsSuccess = createAction(
    Actions.FetchCatalogueSegmentationsSuccess,
    props<{ data: CatalogueSegmentation[]; total: number }>()
);

export const fetchCatalogueSegmentationsFailure = createAction(
    Actions.FetchCatalogueSegmentationsFailure,
    props<{ payload: ErrorHandler }>()
);

export const resetState = createAction(Actions.ResetState);

export const refreshTable = createAction(
    Actions.RefreshTable,
    props<{ payload: { refreshStatus: boolean } }>()
);

/**
 * CONFIRMATION
 */

export const DeleteCatalogueSegmentationsSuccess = createAction(
    Actions.DeleteCatalogueSegmentationsSuccess,
    props<{ payload: { id: number } }>()
);

export type FailureActions = 'fetchCatalogueSegmentationsFailure';
