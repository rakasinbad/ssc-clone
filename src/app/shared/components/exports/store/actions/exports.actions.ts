import { createAction, props } from '@ngrx/store';
import { IErrorHandler, TSource, IQueryParams } from 'app/shared/models';
import { Export } from '../../models';

export type requestActionNames =
    'fetchExportLogsRequest' |
    'startExportRequest'
;

export type failureActionNames =
    'fetchExportLogsFailure' |
    'startExportFailure'
;

export type exportModuleNames =
    'catalogues' |
    'journey-plans' |
    'payments' |
    'portfolios' |
    'orders' |
    'stores'
;

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

/** START EXPORT */
export const startExportRequest = createAction(
    '[Export API] Start Export Request',
    props<{ payload: IQueryParams }>()
);

export const startExportFailure = createAction(
    '[Export API] Start Export Failure',
    props<{ payload: IErrorHandler }>()
);
    
export const startExportSuccess = createAction(
    '[Portfolios API] Start Export Success',
    props<{ payload: any }>()
);

export const truncateExportLogs = createAction('[Export Page] Truncate Export Logs');
