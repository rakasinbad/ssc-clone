import { createAction, props } from '@ngrx/store';
import { ErrorHandler, EStatus } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { Update } from '@ngrx/entity';
import { RejectReason } from '../../models';

// -----------------------------------------------------------------------------------------------------
// Fetch Reject Reason List
// -----------------------------------------------------------------------------------------------------

export const fetchRejectReasonRequest = createAction(
    '[Collection API] Fetch Reject Reason Request',
    props<{ payload: { type: string } }>()
);

export const fetchRejectReasonFailure = createAction(
    '[Collection API] Fetch Reject Reason Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchRejectReasonSuccess = createAction(
    '[Collection API] Fetch Reject Reason Success',
    props<{ payload: { data: RejectReason[] } }>()
);

export const clearState = createAction('[Collection Page] Reset Collection Core State');

export const clearRejectReason = createAction('[Collection Page] Reset Reject Reason State');

export type FailureActions = 'fetchRejectReasonFailure';