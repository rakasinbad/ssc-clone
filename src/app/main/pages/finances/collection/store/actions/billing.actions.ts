import { createAction, props } from '@ngrx/store';
import { IQueryParams } from 'app/shared/models/query.model';
import { ErrorHandler } from 'app/shared/models/global.model';
import {
    BillingStatus,
    FinanceDetailBillingV1,
    IBillingPayments,
} from '../../models';
import { Update } from '@ngrx/entity';

const featureKey = `[Billing API]`;


// -----------------------------------------------------------------------------------------------------
// Fetch Billing Status List
// -----------------------------------------------------------------------------------------------------

export const fetchBillingStatusRequest = createAction(
    `${featureKey} Fetch Billing Status List Request`,
    props<{ payload: IQueryParams }>()
);

export const fetchBillingStatusFailure = createAction(
    `${featureKey} Fetch Billing Status List Failure`,
    props<{ payload: ErrorHandler }>()
);

export const fetchBillingStatusSuccess = createAction(
    `${featureKey} Fetch Billing Status List Success`,
    props<{ payload: { data: BillingStatus[]; total: number } }>()
);
// -----------------------------------------------------------------------------------------------------
// Fetch Billing Detail
// -----------------------------------------------------------------------------------------------------
export const fetchBillingDetailRequest = createAction(
    `${featureKey} Fetch Detail Billing Request`,
    props<{ payload: { id: string, type: "initial" | "approve" | "reject" } }>()
);

export const fetchBillingDetailFailure = createAction(
    `${featureKey} Fetch Detail Billing Request Failure`,
    props<{ payload: ErrorHandler }>()
);

export const fetchBillingDetailSuccess = createAction(
    `${featureKey} Fetch Detail Billing Request Success`,
    props<{ payload: FinanceDetailBillingV1 }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - CHANGE UPDATE BILLING] Billing
// -----------------------------------------------------------------------------------------------------
export const setRefreshStatus = createAction(
    `${featureKey} Set Refresh Status`,
    props<{ payload: boolean }>()
);

export const fetchBillingDetailUpdateFailure = createAction(
    `${featureKey} Fetch Detail Billing Update Request Failure`,
    props<{ payload: ErrorHandler }>()
);

export const fetchBillingDetailUpdateRequest = createAction(
    `${featureKey} Fetch Detail Billing Update After Approve Request`,
    props<{ payload: { idDetail: string, type: "approve" | "reject" } }>()
);

export const fetchBillingDetailUpdate = createAction(
    `${featureKey} Fetch Detail Billing Update Request`,
    props<{ payload: Update<IBillingPayments> }>()
);

export const clearState = createAction(`${featureKey} Reset Billing Core State`);

export type FailureActions = 'fetchBillingStatusFailure';