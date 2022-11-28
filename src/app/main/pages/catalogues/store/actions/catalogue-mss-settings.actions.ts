import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { Action } from 'rxjs/internal/scheduler/Action';
import { CatalogueMssSettings, CatalogueMssSettingsSegmentation, UpsertMssSettings, ResponseUpsertMssSettings, MssBaseSupplier } from '../../models';

enum Actions {
    FetchFailure = '[Catalogue] Fetch Catalogue Mss Settings Failure',
    FetchRequest = '[Catalogue] Fetch Catalogue Mss Settings Request',
    FetchSuccess = '[Catalogue] Fetch Catalogue Mss Settings Success',
    UpdateDataMssSettings = '[Catalogue] Update Data Catalogue Mss Settings',
    FetchSegmentationsFailure = '[Catalogue] Fetch Catalogue Mss Settings Segmentation Failure',
    FetchSegmentationsRequest = '[Catalogue] Fetch Catalogue Mss Settings Segmentation Request',
    FetchSegmentationsSuccess = '[Catalogue] Fetch Catalogue Mss Settings Segmentation Success',
    UpsertMssSettingsRequest = '[Catalogue] Upsert Catalogue Mss Settings Request',
    UpsertMssSettingsSuccess = '[Catalogue] Upsert Catalogue Mss Settings Success',
    UpsertMssSettingsFailure = '[Catalogue] Upsert Catalogue Mss Settings Failure',
    ResetState = '[Catalogue] Reset Catalogue Mss Settings',
    FetchMssBaseFailure = '[Catalogue] Fetch Catalogue Mss Base Supplier Failure',
    FetchMssBaseRequest = '[Catalogue] Fetch Catalogue Mss Base Supplier Request',
    FetchMssBaseSuccess = '[Catalogue] Fetch Catalogue Mss Base Supplier Success',
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

export const upsertRequest = createAction(
    Actions.UpsertMssSettingsRequest,
    // tslint:disable-next-line
    props<{
        payload: Partial<UpsertMssSettings>;
    }>()
);

export const upsertFailure = createAction(
    Actions.UpsertMssSettingsFailure,
    props<{ payload: ErrorHandler }>()
);

export const upsertSuccess = createAction(
    Actions.UpsertMssSettingsSuccess,
    props<{
        data: ResponseUpsertMssSettings;
    }>()
);

export const fetchMssBaseRequest = createAction(
    Actions.FetchMssBaseRequest,
    props<{ supplierId: string, queryParams: IQueryParams }>()
);

export const fetchMssBaseSuccess = createAction(
    Actions.FetchMssBaseSuccess,
    props<{ data: MssBaseSupplier; }>()
);

export const fetchMssBaseFailure = createAction(Actions.FetchMssBaseFailure, props<{ payload: ErrorHandler }>());

export type FailureActions = 
    'fetchFailure' 
    | 'fetchSegmentationsFailure' 
    | 'upsertFailure'
    | 'fetchMssBaseFailure';
