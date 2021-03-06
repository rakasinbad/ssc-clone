import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

import { ImportLog } from '../../models';

export const importHistoryRequest = createAction(
    '[Import] Import History Request',
    props<{ payload: { params: IQueryParams; page: string } }>()
);

export const importHistoryFailure = createAction(
    '[Import] Import History Failure',
    props<{ payload: ErrorHandler }>()
);

export const importHistorySuccess = createAction(
    '[Import] Import History Success',
    props<{ payload: { data: Array<ImportLog>; total: number } }>()
);

export const resetImportHistory = createAction('[Import] Reset Import History State');
