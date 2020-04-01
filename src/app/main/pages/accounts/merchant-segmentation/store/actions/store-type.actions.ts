import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

import {
    PayloadStoreType,
    PayloadStoreTypePatch,
    StoreSegment,
    StoreSegmentTree,
    StoreType
} from '../../models';

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
    props<{ payload: StoreSegment<StoreType> }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Store Last Type
// -----------------------------------------------------------------------------------------------------

export const fetchStoreLastTypeRequest = createAction(
    '[Store Segmentation] Fetch Store Last Type Request',
    props<{ payload: IQueryParams }>()
);

export const fetchStoreLastTypeFailure = createAction(
    '[Store Segmentation] Fetch Store Last Type Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchStoreLastTypeSuccess = createAction(
    '[Store Segmentation] Fetch Store Last Type Success',
    props<{ payload: { data: Array<StoreSegmentTree>; total: number } }>()
);

// -----------------------------------------------------------------------------------------------------
// Refresh Store Types
// -----------------------------------------------------------------------------------------------------

export const refreshStoreTypesRequest = createAction(
    '[Store Segmentation] Refresh Store Types Request',
    props<{ payload: IQueryParams }>()
);

export const refreshStoreTypesFailure = createAction(
    '[Store Segmentation] Refresh Store Types Failure',
    props<{ payload: ErrorHandler }>()
);

export const refreshStoreTypesSuccess = createAction(
    '[Store Segmentation] Refresh Store Types Success',
    props<{ payload: StoreSegment<StoreType> }>()
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

// -----------------------------------------------------------------------------------------------------
// [CRUD - UPDATE] Store Type
// -----------------------------------------------------------------------------------------------------

export const updateStoreTypeRequest = createAction(
    '[Store Segmentation] Update Store Type Request',
    props<{ payload: { body: PayloadStoreTypePatch; id: string } }>()
);

export const updateStoreTypeFailure = createAction(
    '[Store Segmentation] Update Store Type Failure',
    props<{ payload: ErrorHandler }>()
);

export const updateStoreTypeSuccess = createAction(
    '[Store Segmentation] Update Store Type Success'
);

export const clearState = createAction('[Store Segmentation] Reset Store Types Core State');

export const clearTableState = createAction(
    '[Store Segmentation] Reset Store Last Type Core State'
);

export type FailureActions =
    | 'fetchStoreTypesFailure'
    | 'fetchStoreLastTypeFailure'
    | 'refreshStoreTypesFailure'
    | 'createStoreTypeFailure'
    | 'updateStoreTypeFailure';
