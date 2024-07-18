import { createAction, props } from '@ngrx/store';
import { ErrorHandler, EStatus } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

import {
    PayloadStoreChannel,
    PayloadStoreChannelPatch,
    StoreChannel,
    StoreSegment,
    StoreSegmentTree
} from '../../models';

// -----------------------------------------------------------------------------------------------------
// Fetch Store Channels
// -----------------------------------------------------------------------------------------------------

export const fetchStoreChannelsRequest = createAction(
    '[Store Segmentation] Fetch Store Channels Request',
    props<{ payload: IQueryParams }>()
);

export const fetchStoreChannelsFailure = createAction(
    '[Store Segmentation] Fetch Store Channels Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchStoreChannelsSuccess = createAction(
    '[Store Segmentation] Fetch Store Channels Success',
    props<{ payload: StoreSegment<StoreChannel> }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Store Last Channel
// -----------------------------------------------------------------------------------------------------

export const fetchStoreLastChannelRequest = createAction(
    '[Store Segmentation] Fetch Store Last Channel Request',
    props<{ payload: IQueryParams }>()
);

export const fetchStoreLastChannelFailure = createAction(
    '[Store Segmentation] Fetch Store Last Channel Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchStoreLastChannelSuccess = createAction(
    '[Store Segmentation] Fetch Store Last Channel Success',
    props<{ payload: { data: Array<StoreSegmentTree>; total: number } }>()
);

// -----------------------------------------------------------------------------------------------------
// Refresh Store Channels
// -----------------------------------------------------------------------------------------------------

export const refreshStoreChannelsRequest = createAction(
    '[Store Segmentation] Refresh Store Channels Request',
    props<{ payload: IQueryParams }>()
);

export const refreshStoreChannelsFailure = createAction(
    '[Store Segmentation] Refresh Store Channels Failure',
    props<{ payload: ErrorHandler }>()
);

export const refreshStoreChannelsSuccess = createAction(
    '[Store Segmentation] Refresh Store Channels Success',
    props<{ payload: StoreSegment<StoreChannel> }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - CREATE] Store Channel
// -----------------------------------------------------------------------------------------------------

export const createStoreChannelRequest = createAction(
    '[Store Segmentation] Create Store Channel Request',
    props<{ payload: PayloadStoreChannel }>()
);

export const createStoreChannelFailure = createAction(
    '[Store Segmentation] Create Store Channel Failure',
    props<{ payload: ErrorHandler }>()
);

export const createStoreChannelSuccess = createAction(
    '[Store Segmentation] Create Store Channel Success'
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - UPDATE] Store Channel
// -----------------------------------------------------------------------------------------------------

export const updateStoreChannelRequest = createAction(
    '[Store Segmentation] Update Store Channel Request',
    props<{ payload: { body: PayloadStoreChannelPatch; id: string } }>()
);

export const updateStoreChannelFailure = createAction(
    '[Store Segmentation] Update Store Channel Failure',
    props<{ payload: ErrorHandler }>()
);

export const updateStoreChannelSuccess = createAction(
    '[Store Segmentation] Update Store Channel Success',
    props<{ payload: { id: string, deactive: boolean } }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - CHANGE STATUS] Store Channel
// -----------------------------------------------------------------------------------------------------

export const confirmChangeStatusStoreChannel = createAction(
    '[Store Segmentation] Confirm Change Status Store Channel',
    props<{ payload: StoreChannel }>()
);

export const cancelConfirmChangeStatusStoreChannel = createAction(
    '[Store Segmentation] Cancel Confirm Change Status Store Channel'
);

export const changeStatusStoreChannelRequest = createAction(
    '[Store Segmentation] Change Status Store Channel Request',
    props<{ payload: { body: EStatus; id: string } }>()
);

export const changeStatusStoreChannelFailure = createAction(
    '[Store Segmentation] Change Status Store Channel Failure',
    props<{ payload: ErrorHandler }>()
);

export const changeStatusStoreChannelSuccess = createAction(
    '[Store Segmentation] Change Status Store Channel Success'
);

export const clearState = createAction('[Store Segmentation] Reset Store Channels Core State');

export const clearTableState = createAction(
    '[Store Segmentation] Reset Store Last Channel Core State'
);

export type FailureActions =
    | 'fetchStoreChannelsFailure'
    | 'fetchStoreLastChannelFailure'
    | 'refreshStoreChannelsFailure'
    | 'createStoreChannelFailure'
    | 'updateStoreChannelFailure';
