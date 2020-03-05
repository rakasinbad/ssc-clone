import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

import { ExportLog, PayloadTemplateHistory } from '../../models';

export const templateHistoryRequest = createAction(
    '[Import] Template History Request',
    props<{ payload: { params: IQueryParams; type: string; page: string } }>()
);

export const templateHistoryFailure = createAction(
    '[Import] Template History Failure',
    props<{ payload: ErrorHandler }>()
);

export const templateHistorySuccess = createAction(
    '[Import] Template History Success',
    props<{ payload: { data: Array<ExportLog>; total: number } }>()
);

export const createTemplateHistoryRequest = createAction(
    '[Import] Create Template History Request',
    props<{ payload: PayloadTemplateHistory }>()
);

export const createTemplateHistoryFailure = createAction(
    '[Import] Create Template History Failure',
    props<{ payload: ErrorHandler }>()
);

export const createTemplateHistorySuccess = createAction(
    '[Import] Create Template History Success'
);

export const resetTemplateHistory = createAction('[Import] Reset Template History State');

export const resetDownloadState = createAction('[Import] Reset Download State');
