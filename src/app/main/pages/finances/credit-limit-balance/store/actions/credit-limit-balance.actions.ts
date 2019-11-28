import { Update } from '@ngrx/entity';
import { createAction, props } from '@ngrx/store';
import { IErrorHandler, IQueryParams } from 'app/shared/models';

import {
    CreditLimitGroup,
    CreditLimitGroupForm,
    CreditLimitStore,
    CreditLimitStoreOptions,
    ICreditLimitBalanceDemo
} from '../../models';

// -----------------------------------------------------------------------------------------------------
// Fetch Credit Limit Stores
// -----------------------------------------------------------------------------------------------------

export const fetchCreditLimitStoresRequest = createAction(
    '[Credit Limit Stores API] Fetch Credit Limit Stores Request',
    props<{ payload: IQueryParams }>()
);

export const fetchCreditLimitStoresFailure = createAction(
    '[Credit Limit Stores API] Fetch Credit Limit Stores Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchCreditLimitStoresSuccess = createAction(
    '[Credit Limit Stores API] Fetch Credit Limit Stores Success',
    props<{ payload: { data: CreditLimitStore[]; total: number } }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Credit Limit Store
// -----------------------------------------------------------------------------------------------------

export const fetchCreditLimitStoreRequest = createAction(
    '[Credit Limit Store API] Fetch Credit Limit Store Request',
    props<{ payload: string }>()
);

export const fetchCreditLimitStoreFailure = createAction(
    '[Credit Limit Store API] Fetch Credit Limit Store Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchCreditLimitStoreSuccess = createAction(
    '[Credit Limit Store API] Fetch Credit Limit Store Success',
    props<{ payload: { data: Update<CreditLimitStore>; id: string } }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - UPDATE CREDIT LIMIT STORE] Credit Limit Store
// -----------------------------------------------------------------------------------------------------

export const confirmUpdateCreditLimitStore = createAction(
    '[Credit Limit Stores Page] Confirm Update Credit Limit Store',
    props<{ payload: CreditLimitStoreOptions }>()
);

export const updateCreditLimitStoreRequest = createAction(
    '[Credit Limit Stores API] Update Credit Limit Store Request',
    props<{ payload: { body: CreditLimitStoreOptions; id: string } }>()
);

export const updateCreditLimitStoreFailure = createAction(
    '[Credit Limit Stores API] Update Credit Limit Stores Failure',
    props<{ payload: IErrorHandler }>()
);

export const updateCreditLimitStoreSuccess = createAction(
    '[Credit Limit Stores API] Update Credit Limit Stores Success',
    props<{ payload: Update<CreditLimitStore> }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - CHANGE STATUS FREEZE BALANCE] Freeze Balance Status
// -----------------------------------------------------------------------------------------------------

export const confirmChangeFreezeBalanceStatus = createAction(
    '[Credit Limit Stores Page] Confirm Change Freeze Balance Status',
    props<{ payload: CreditLimitStore }>()
);

export const updateStatusFreezeBalanceRequest = createAction(
    '[Credit Limit Stores API] Update Status Freeze Balance Request',
    props<{ payload: { body: boolean; id: string } }>()
);

export const updateStatusFreezeBalanceFailure = createAction(
    '[Credit Limit Stores API] Update Status Freeze Balance Failure',
    props<{ payload: IErrorHandler }>()
);

export const updateStatusFreezeBalanceSuccess = createAction(
    '[Credit Limit Stores API] Update Status Freeze Balance Success',
    props<{ payload: Update<CreditLimitStore> }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Credit Limit Groups
// -----------------------------------------------------------------------------------------------------

export const fetchCreditLimitGroupsRequest = createAction(
    '[Credit Limit Groups API] Fetch Credit Limit Groups Request',
    props<{ payload: IQueryParams }>()
);

export const fetchCreditLimitGroupsFailure = createAction(
    '[Credit Limit Groups API] Fetch Credit Limit Groups Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchCreditLimitGroupsSuccess = createAction(
    '[Credit Limit Groups API] Fetch Credit Limit Groups Success',
    props<{ payload: CreditLimitGroup[] }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - CREATE CREDIT LIMIT GROUP] Credit Limit Groups
// -----------------------------------------------------------------------------------------------------

export const createCreditLimitGroupRequest = createAction(
    '[Credit Limit Groups API] Create Credit Limit Group Request',
    props<{ payload: any }>()
);

export const createCreditLimitGroupFailure = createAction(
    '[Credit Limit Groups API] Create Credit Limit Group Failure',
    props<{ payload: IErrorHandler }>()
);

export const createCreditLimitGroupSuccess = createAction(
    '[Credit Limit Groups API] Create Credit Limit Group Success',
    props<{ payload: CreditLimitGroup }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - UPDATE CREDIT LIMIT GROUP] Credit Limit Groups
// -----------------------------------------------------------------------------------------------------

export const updateCreditLimitGroupRequest = createAction(
    '[Credit Limit Groups API] Update Credit Limit Group Request',
    props<{ payload: { id: string; body: Partial<CreditLimitGroupForm> } }>()
);

export const updateCreditLimitGroupFailure = createAction(
    '[Credit Limit Groups API] Update Credit Limit Group Failure',
    props<{ payload: IErrorHandler }>()
);

export const updateCreditLimitGroupSuccess = createAction(
    '[Credit Limit Groups API] Update Credit Limit Group Success',
    props<{ payload: CreditLimitGroup }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - DELETE CREDIT LIMIT GROUP] Credit Limit Groups
// -----------------------------------------------------------------------------------------------------

export const confirmDeleteCreditLimitGroup = createAction(
    '[Credit Limit Groups Page] Confirm Delete Credit Limit Group',
    props<{ payload: CreditLimitGroup }>()
);

export const deleteCreditLimitGroupRequest = createAction(
    '[Credit Limit Groups API] Delete Credit Limit Group Request',
    props<{ payload: string }>()
);

export const deleteCreditLimitGroupFailure = createAction(
    '[Credit Limit Groups API] Delete Credit Limit Group Failure',
    props<{ payload: IErrorHandler }>()
);

export const deleteCreditLimitGroupSuccess = createAction(
    '[Credit Limit Groups API] Delete Credit Limit Group Success',
    props<{ payload: string }>()
);

// -----------------------------------------------------------------------------------------------------
// Helper Actions
// -----------------------------------------------------------------------------------------------------

export const resetCoreState = createAction(
    '[Credit Limit Groups API] Reset Core Credit Limit Balance State'
);

// export const resetCreditLimitBalance

// -----------------------------------------------------------------------------------------------------
// For Demo
// -----------------------------------------------------------------------------------------------------

export const generateCreditLimitBalanceDemo = createAction(
    '[Credit Limit Balance Page] Generate Credit Limit Balance Demo',
    props<{ payload: ICreditLimitBalanceDemo[] }>()
);

export const getCreditLimitBalanceDemoDetail = createAction(
    '[Credit Limit Balance Page] Get Credit Limit Balance Demo Detail',
    props<{ payload: string }>()
);
