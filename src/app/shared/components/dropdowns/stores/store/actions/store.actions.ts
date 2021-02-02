import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';

import { IMassUpload, MassUploadResponse, IMassUploadData } from '../../models';

export const importMassConfirmRequest = createAction(
    '[Import] Mass Upload Confirm Request',
    props<{ payload: IMassUpload }>()
);

export const importMassRequest = createAction(
    '[Import] Mass Upload Request',
    props<{ payload: IMassUpload }>()
);

export const importMassFailure = createAction(
    '[Import] Mass Upload Failure',
    props<{ payload: ErrorHandler }>()
);

export const importMassSuccess = createAction(
    '[Import] Mass Upload Success',
        props<{ payload: IMassUploadData }>()
    );

export const importConfigRequest = createAction(
    '[Import] Import Config Mass Upload Request',
    props<{ payload: string }>()
);

export const importConfigFailure = createAction(
    '[Import] Import Config Mass Upload Failure',
    props<{ payload: ErrorHandler }>()
);

export const clearState = createAction('[Import] Mass Upload Core State');
