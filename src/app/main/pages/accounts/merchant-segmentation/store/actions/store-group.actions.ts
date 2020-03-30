import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

import { PayloadStoreGroup, StoreGroup, StoreSegment, StoreSegmentTree } from '../../models';

// -----------------------------------------------------------------------------------------------------
// Fetch Store Groups
// -----------------------------------------------------------------------------------------------------

export const fetchStoreGroupsRequest = createAction(
    '[Store Segmentation] Fetch Store Groups Request',
    props<{ payload: IQueryParams }>()
);

export const fetchStoreGroupsFailure = createAction(
    '[Store Segmentation] Fetch Store Groups Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchStoreGroupsSuccess = createAction(
    '[Store Segmentation] Fetch Store Groups Success',
    props<{ payload: StoreSegment<StoreGroup> }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Store Last Group
// -----------------------------------------------------------------------------------------------------

export const fetchStoreLastGroupRequest = createAction(
    '[Store Segmentation] Fetch Store Last Group Request',
    props<{ payload: IQueryParams }>()
);

export const fetchStoreLastGroupFailure = createAction(
    '[Store Segmentation] Fetch Store Last Group Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchStoreLastGroupSuccess = createAction(
    '[Store Segmentation] Fetch Store Last Group Success',
    props<{ payload: { data: Array<StoreSegmentTree>; total: number } }>()
);

// -----------------------------------------------------------------------------------------------------
// Refresh Store Groups
// -----------------------------------------------------------------------------------------------------

export const refreshStoreGroupsRequest = createAction(
    '[Store Segmentation] Refresh Store Groups Request',
    props<{ payload: IQueryParams }>()
);

export const refreshStoreGroupsFailure = createAction(
    '[Store Segmentation] Refresh Store Groups Failure',
    props<{ payload: ErrorHandler }>()
);

export const refreshStoreGroupsSuccess = createAction(
    '[Store Segmentation] Refresh Store Groups Success',
    props<{ payload: StoreSegment<StoreGroup> }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - CREATE] Store Group
// -----------------------------------------------------------------------------------------------------

export const createStoreGroupRequest = createAction(
    '[Store Segmentation] Create Store Group Request',
    props<{ payload: PayloadStoreGroup }>()
);

export const createStoreGroupFailure = createAction(
    '[Store Segmentation] Create Store Group Failure',
    props<{ payload: ErrorHandler }>()
);

export const createStoreGroupSuccess = createAction(
    '[Store Segmentation] Create Store Group Success'
);

export const clearState = createAction('[Store Segmentation] Reset Store Groups Core State');

export const clearTableState = createAction(
    '[Store Segmentation] Reset Store Last Group Core State'
);

export type FailureActions =
    | 'fetchStoreGroupsFailure'
    | 'fetchStoreLastGroupFailure'
    | 'refreshStoreGroupsFailure'
    | 'createStoreGroupFailure';
