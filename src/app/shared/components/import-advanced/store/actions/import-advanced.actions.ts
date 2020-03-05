import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';

import { IConfigImportAdvanced, IImportAdvanced } from '../../models';

export const importConfirmRequest = createAction(
    '[Import] Import Confirm Request',
    props<{ payload: IImportAdvanced }>()
);

export const importRequest = createAction(
    '[Import] Import Request',
    props<{ payload: IImportAdvanced }>()
);

export const importFailure = createAction(
    '[Import] Import Failure',
    props<{ payload: ErrorHandler }>()
);

export const importSuccess = createAction('[Import] Import Success');

export const importConfigRequest = createAction(
    '[Import] Import Config Request',
    props<{ payload: string }>()
);

export const importConfigFailure = createAction(
    '[Import] Import Config Failure',
    props<{ payload: ErrorHandler }>()
);

export const importConfigSuccess = createAction(
    '[Import] Import Config Success',
    props<{ payload: IConfigImportAdvanced }>()
);

export const resetImportConfig = createAction('[Import] Reset Config State');
