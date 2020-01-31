import { createAction, props } from '@ngrx/store';
import { ErrorHandler, IQueryParams } from 'app/shared/models';

import { ExportLog } from '../../models';

export const templateHistoryRequest = createAction(
    '[Import] Template History Request',
    props<{ payload: { params: IQueryParams; type: string } }>()
);

export const templateHistoryFailure = createAction(
    '[Import] Template History Failure',
    props<{ payload: ErrorHandler }>()
);

export const templateHistorySuccess = createAction(
    '[Import] Template History Success',
    props<{ payload: { data: Array<ExportLog>; total: number } }>()
);

export const resetTemplateHistory = createAction('[Import] Reset Template History State');
