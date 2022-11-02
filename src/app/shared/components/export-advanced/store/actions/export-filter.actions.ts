import { createAction, props } from '@ngrx/store';
import { IErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

import { ExportConfiguration, ExportFormData } from '../../models';

export type requestActionNames =
    | 'prepareExportCheck'
    | 'startExportRequest';

export type failureActionNames =
    | 'prepareExportFailure'
    | 'startExportFailure';

export type ExportModuleNames =
    'catalogues' |
    'journey-plans' |
    'payments' |
    'invoices' |
    'portfolios' |
    'orders' |
    'stores'
;

/** START EXPORT */
export const startExportRequest = createAction(
    '[Export Advanced Filter API] Start Export Request',
    props<{ payload: IQueryParams & ExportConfiguration & { formData: ExportFormData } }>()
);

export const startExportFailure = createAction(
    '[Export Advanced Filter API] Start Export Failure',
    props<{ payload: IErrorHandler }>()
);

export const startExportSuccess = createAction(
    '[Export Advanced Portfolios API] Start Export Success',
    props<{ payload: { message: string } }>()
);

export const truncateExportFilter = createAction('[Export Advanced Page] Truncate Export Filter');

