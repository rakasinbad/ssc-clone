import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

import { PayloadStoreType, StoreType } from '../../models';

// -----------------------------------------------------------------------------------------------------
// Fetch Store Types
// -----------------------------------------------------------------------------------------------------

export const fetchStoreTypesRequest = createAction(
    '[Store Segmentation] Fetch Store Types Request',
    props<{ payload: IQueryParams }>()
);

export const fetchStoreTypesFailure = createAction(
    '[Store Segmentation] Fetch Store Types Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchStoreTypesSuccess = createAction(
    '[Store Segmentation] Fetch Store Types Success',
    props<{ payload: { data: Array<StoreType>; deepestLevel: number } }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - CREATE] Store Type
// -----------------------------------------------------------------------------------------------------

export const createStoreTypeRequest = createAction(
    '[Store Segmentation] Create Store Type Request',
    props<{ payload: PayloadStoreType }>()
);

export const createStoreTypeFailure = createAction(
    '[Store Segmentation] Create Store Type Failure',
    props<{ payload: ErrorHandler }>()
);

export const createStoreTypeSuccess = createAction(
    '[Store Segmentation] Create Store Type Success'
);

export const clearState = createAction('[Store Segmentation] Reset Store Types Core State');

export type FailureActions = 'fetchStoreTypesFailure' | 'createStoreTypeFailure';
