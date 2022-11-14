import { createAction, props } from '@ngrx/store';
import { ErrorHandler, EStatus } from 'app/shared/models/global.model';
import { IImportProductsProgress, } from '../../models';

// -----------------------------------------------------------------------------------------------------
// Import Product 
// -----------------------------------------------------------------------------------------------------

export const importProductsProgressRequest = createAction(
    '[IMPORT PRODUCT PROGRESS] Import Product Progress Request',
    props<{ payload: string }>()
);

export const importProductsProgressFailure = createAction(
    '[IMPORT PRODUCT PROGRESS] Import Product Progress Failure',
    props<{ payload: ErrorHandler }>()
);

export const importProductsProgressSuccess = createAction(
    '[IMPORT PRODUCT PROGRESS] Import Product Progress Success',
    props<{ payload: IImportProductsProgress }>()
);

export const importProductsProgressClearState = createAction('[IMPORT PRODUCT PROGRESS] Clear State Import Product Progress');