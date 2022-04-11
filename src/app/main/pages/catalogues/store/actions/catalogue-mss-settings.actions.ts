import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { CatalogueMssSettings, CatalogueMssSettingsSegmentation } from '../../models';

enum Actions {
    FetchFailure = '[Catalogue] Fetch Catalogue Mss Settings Failure',
    FetchRequest = '[Catalogue] Fetch Catalogue Mss Settings Request',
    FetchSuccess = '[Catalogue] Fetch Catalogue Mss Settings Success',
    UpdateDataMssSettings = '[Catalogue] Update Data Catalogue Mss Settings',
    FetchSegmentationsFailure = '[Catalogue] Fetch Catalogue Mss Settings Segmentation Failure',
    FetchSegmentationsRequest = '[Catalogue] Fetch Catalogue Mss Settings Segmentation Request',
    FetchSegmentationsSuccess = '[Catalogue] Fetch Catalogue Mss Settings Segmentation Success',
    ResetState = '[Catalogue] Reset Catalogue Mss Settings',
}

export const fetchRequest = createAction(
    Actions.FetchRequest,
    props<{ queryParams: IQueryParams }>()
);

export const fetchSuccess = createAction(
    Actions.FetchSuccess,
    props<{ data: CatalogueMssSettings[]; total: number }>()
);

export const fetchFailure = createAction(Actions.FetchFailure, props<{ payload: ErrorHandler }>());

export const updateDataMssSettings = createAction(
    Actions.UpdateDataMssSettings,
    props<{ data: CatalogueMssSettings[]; }>()
);

export const fetchSegmentationsRequest = createAction(
    Actions.FetchSegmentationsRequest,
    props<{ queryParams: IQueryParams }>()
);

export const fetchSegmentationsSuccess = createAction(
    Actions.FetchSegmentationsSuccess,
    props<{ data: CatalogueMssSettingsSegmentation[]; total: number }>()
);

export const fetchSegmentationsFailure = createAction(Actions.FetchSegmentationsFailure, props<{ payload: ErrorHandler }>());

export type FailureActions = 'fetchFailure' | 'fetchSegmentationsFailure';
