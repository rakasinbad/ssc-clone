import { createAction, props } from '@ngrx/store';
import { IErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

import { Export, ExportConfiguration, ExportFormData } from '../../models';

export type requestActionNames =
    | 'fetchExportLogsRequest'
    | 'prepareExportCheck'
    | 'startExportRequest';

export type failureActionNames =
    | 'fetchExportLogsFailure'
    | 'prepareExportFailure'
    | 'startExportFailure';

// export type ExportModuleNames =
//     'catalogues' |
//     'journey-plans' |
//     'payments' |
//     'portfolios' |
//     'orders' |
//     'stores'
// ;

/** FETCH EXPORT LOGS */
export const fetchExportLogsRequest = createAction(
    '[Export API] Fetch Export Logs Request',
    props<{ payload: IQueryParams }>()
);

export const fetchExportLogsFailure = createAction(
    '[Export API] Fetch Export Logs Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchExportLogsSuccess = createAction(
    '[Export API] Fetch Export Logs Success',
    props<{ payload: { data: Array<Export>; total: number } }>()
);

/** EXPORT PREPARATION */

export const prepareExportCheck = createAction(
    '[Export API] Prepare Export Check',
    props<{ payload: IQueryParams & ExportConfiguration }>()
);

export const prepareExportFailure = createAction(
    '[Export API] Prepare Export Failure',
    props<{ payload: IErrorHandler }>()
);

export const setExportPage = createAction(
    '[Export API] Set Export Page',
    props<{ payload: string }>()
);

/** START EXPORT */
export const startExportRequest = createAction(
    '[Export API] Start Export Request',
    props<{ payload: IQueryParams & ExportConfiguration & { formData: ExportFormData } }>()
);

export const startExportFailure = createAction(
    '[Export API] Start Export Failure',
    props<{ payload: IErrorHandler }>()
);

export const startExportSuccess = createAction(
    '[Portfolios API] Start Export Success',
    props<{ payload: { message: string } }>()
);

export const showExportHistory = createAction(
    '[Export Page] Show Export History',
    props<{ payload: string }>()
);

export const truncateExportFilter = createAction('[Export Page] Truncate Export Filter');

export const truncateExportLogs = createAction('[Export Page] Truncate Export Logs');
