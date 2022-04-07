import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { CatalogueMssSettingsSegmentation } from '../../models';

enum Actions {
    FetchSegmentationsFailure = '[Catalogue] Fetch Catalogue Mss Settings Segmentation Failure',
    FetchSegmentationsRequest = '[Catalogue] Fetch Catalogue Mss Settings Segmentation Request',
    FetchSegmentationsSuccess = '[Catalogue] Fetch Catalogue Mss Settings Segmentation Success',
    ResetState = '[Catalogue] Reset Catalogue Mss Settings',
}

export const fetchSegmentationsRequest = createAction(
    Actions.FetchSegmentationsRequest,
    props<{ queryParams: IQueryParams }>()
);

export const fetchSegmentationsSuccess = createAction(
    Actions.FetchSegmentationsSuccess,
    props<{ data: CatalogueMssSettingsSegmentation[]; total: number }>()
);

export const fetchSegmentationsFailure = createAction(Actions.FetchSegmentationsFailure, props<{ payload: ErrorHandler }>());

export type FailureActions = 'fetchSegmentationsFailure';
