import { createAction, props } from '@ngrx/store';
import { ErrorHandler, EStatus } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { Update } from '@ngrx/entity';

import {
    FinanceCollectionPayload,
    FinanceDetailCollection,
    CalculateCollectionStatusPayment,
    ICollectionPhoto,
    CollectionStatus,
} from '../../models';

// -----------------------------------------------------------------------------------------------------
// Fetch Calculate Collection Status by Payment
// -----------------------------------------------------------------------------------------------------

export const fetchCalculateCollectionStatusRequest = createAction(
    '[Calculate Collection API] Fetch Calculate Collection Status Request',
    props<{ payload: { parameter?: IQueryParams } }>()
);

export const fetchCalculateCollectionStatusFailure = createAction(
    '[Calculate Collection API] Fetch Calculate Collection Status Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchCalculateCollectionStatusSuccess = createAction(
    '[Calculate Collection API] Fetch Calculate Collection Status Success',
    props<{ payload: { data: CalculateCollectionStatusPayment[] } }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Collection Status List
// -----------------------------------------------------------------------------------------------------

export const fetchCollectionStatusRequest = createAction(
    '[Collection API] Fetch Collection Status List Request',
    props<{ payload: IQueryParams }>()
);

export const fetchCollectionStatusFailure = createAction(
    '[Collection API] Fetch Collection Status List Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchCollectionStatusSuccess = createAction(
    '[Collection API] Fetch Collection Status List Success',
    props<{ payload: { data: CollectionStatus[]; total: number } }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Collection Detail
// -----------------------------------------------------------------------------------------------------

export const fetchCollectionDetailRequest = createAction(
    '[Collection API] Fetch Detail Collection Request',
    props<{ payload: { id: string } }>()
);

export const fetchCollectionDetailFailure = createAction(
    '[Collection API] Fetch Detail Collection Request Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchCollectionDetailSuccess = createAction(
    '[Collection API] Fetch Detail Collection Request Success',
    props<{ payload: FinanceDetailCollection }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Collection Photo
// -----------------------------------------------------------------------------------------------------

export const fetchCollectionPhotoRequest = createAction(
    '[Collection API] Fetch Collection Photo Request',
    props<{ payload: { id: number } }>()
);

export const fetchCollectionPhotoFailure = createAction(
    '[Collection API] Fetch Collection Photo Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchCollectionPhotoSuccess = createAction(
    '[Collection API] Fetch Collection Photo Success',
    props<{ payload: { data: ICollectionPhoto } }>()
);

export const clearCollectionPhoto = createAction('[Collection Page] Reset Collection Photo State');

// -----------------------------------------------------------------------------------------------------
// [CRUD - CHANGE UPDATE COLLECTION] Collection
// -----------------------------------------------------------------------------------------------------

export const updateCollectionStatusRequest = createAction(
    '[Collection API] Update Collection Status Request',
    props<{ payload: { body: FinanceCollectionPayload } }>()
);

export const updateCollectionStatusSuccess = createAction(
    '[Collection API] Update Collection Status Success',
    props<{ payload: Update<FinanceCollectionPayload> }>()
);

export const updateCollectionStatusFailure = createAction(
    '[Collection API] Update Collection Status Failure',
    props<{ payload: ErrorHandler }>()
);

export const setRefreshStatus = createAction(
    '[Collection Page] Set Refresh Statuse',
    props<{ payload: boolean }>()
);

export const clearState = createAction('[Collection Page] Reset Collection Core State');

export type FailureActions =
    | 'fetchCalculateCollectionStatusFailure'
    | 'fetchCollectionStatusFailure'
    | 'fetchCollectionDetailFailure'
    | 'fetchCollectionPhotoFailure'
    | 'updateCollectionStatusFailure';