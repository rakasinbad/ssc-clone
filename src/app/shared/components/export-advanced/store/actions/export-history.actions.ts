import { createAction, props } from '@ngrx/store';
import { IErrorHandler } from 'app/shared/models/global.model';
import { ExportHistory } from '../../models';
import { ExportConfigurationPage } from '../../models/export-filter.model';
import { IExportHistoryRequest, TExportHistoryAction } from '../../models/export-history.model';

export type requestActionNames = | 'fetchExportHistoryRequest';
export type failureActionNames = 'fetchExportHistoryFailure';

/** FETCH EXPORT HISTORY */
export const fetchExportHistoryRequest = createAction(
    '[Export History] Fetch Export History Request',
    props<{ payload: IExportHistoryRequest }>()
);

export const fetchExportHistoryFailure = createAction(
    '[Export History] Fetch Export History Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchExportHistorySuccess = createAction(
    '[Export History] Fetch Export History Success',
    props<{ payload: { data: Array<ExportHistory>; total: number } }>()
);

export const resetExportHistory = createAction('[Export History] Reset Export History');

export const setExportHistoryPage = createAction(
    '[Export History] Set Export Page',
    props<{ payload: { page: ExportConfigurationPage, tab: TExportHistoryAction } }>()
);

export const resetExportHistoryPage = createAction('[Export History] Reset Export Page');
