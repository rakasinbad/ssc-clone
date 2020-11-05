import { createAction, props } from '@ngrx/store';
import { SupplierVoucher } from '../../models';
import { IQueryParamsVoucher } from 'app/shared/models/query.model';
import { IErrorHandler, TNullable } from 'app/shared/models/global.model';
import { SupplierVoucherPayload } from '../../models/voucher.model';
import { EntityPayload } from 'app/shared/models/entity-payload.model';
// import { VoucherCreationPayload } from '../../models/voucher.model';

export type requestActionNames =
    | 'fetchSupplierVoucherRequest'
    | 'addSupplierVoucherRequest'
    | 'updateSupplierVoucherRequest'
    | 'removeVoucherRequest';

export type failureActionNames =
    | 'fetchSupplierVoucherFailure'
    | 'addSupplierVoucherFailure'
    | 'updateSupplierVoucherFailure'
    | 'removeSupplierVoucherFailure';

/**
 * FETCH DATA
 */

export const fetchSupplierVoucherRequest = createAction(
    '[Promo/SupplierVoucher API] Fetch SupplierVoucher Request',
    props<{ payload: IQueryParamsVoucher | string }>()
);

export const fetchSupplierVoucherFailure = createAction(
    '[Promo/SupplierVoucher API] Fetch SupplierVoucher Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchSupplierVoucherSuccess = createAction(
    '[Promo/SupplierVoucher API] Fetch SupplierVoucher Success',
    props<{ payload: { data: SupplierVoucher | Array<SupplierVoucher>; total?: number } }>()
);

/**
 * CONFIRMATION
 */

export const confirmAddSupplierVoucher = createAction(
    '[SupplierVoucher Page] Confirm Add SupplierVoucher',
    props<{ payload: SupplierVoucher }>()
);

export const confirmUpdateSupplierVoucher = createAction(
    '[SupplierVoucher Page] Confirm Update SupplierVoucher',
    props<{ payload: SupplierVoucher }>()
);

export const confirmSetActiveSupplierVoucher = createAction(
    '[SupplierVoucher Page] Confirm Set to Active SupplierVoucher',
    props<{ payload: SupplierVoucher }>()
);

export const confirmSetInactiveSupplierVoucher = createAction(
    '[SupplierVoucher Page] Confirm Set to Inactive SupplierVoucher',
    props<{ payload: SupplierVoucher }>()
);

export const confirmRemoveSupplierVoucher = createAction(
    '[SupplierVoucher Page] Confirm Remove SupplierVoucher',
    props<{ payload: SupplierVoucher | Array<SupplierVoucher> }>()
);

/**
 * CREATE (ADD)
 */
export const addSupplierVoucherRequest = createAction(
    '[Promo/SupplierVoucher API] Add SupplierVoucher Request',
    props<{ payload: SupplierVoucherPayload }>()
);

export const addSupplierVoucherSuccess = createAction(
    '[Promo/SupplierVoucher API] Add SupplierVoucher Success',
    props<{ payload: TNullable<SupplierVoucher> }>()
);

export const addSupplierVoucherFailure = createAction(
    '[Promo/SupplierVoucher API] Add SupplierVoucher Failure',
    props<{ payload: IErrorHandler }>()
);
//
/**
 * UPDATE
 */
export const updateSupplierVoucherRequest = createAction(
    '[Promo/SupplierVoucher API] Update SupplierVoucher Request',
    props<{ payload: EntityPayload<Partial<SupplierVoucher>> }>()
);

export const updateSupplierVoucherSuccess = createAction(
    '[Promo/SupplierVoucher API] Update SupplierVoucher Success',
    props<{ payload: { id: string; data: SupplierVoucher } }>()
);

export const updateSupplierVoucherFailure = createAction(
    '[Promo/SupplierVoucher API] Update SupplierVoucher Failure',
    props<{ payload: IErrorHandler }>()
);

/**
 * REMOVE (DELETE)
 */
export const removeSupplierVoucherRequest = createAction(
    '[Promo/SupplierVoucher API] Remove SupplierVoucher Request',
    props<{ payload: string }>()
);

export const removeSupplierVoucherSuccess = createAction(
    '[Promo/SupplierVoucher API] Remove SupplierVoucher Success',
    props<{ payload: { id: string; data: SupplierVoucher } }>()
);

export const removeSupplierVoucherFailure = createAction(
    '[Promo/SupplierVoucher API] Remove SupplierVoucher Failure',
    props<{ payload: IErrorHandler }>()
);

/**
 * SELECTION
 */
export const selectSupplierVoucher = createAction(
    '[Promo/SupplierVoucher] Select Period Target Promo',
    props<{ payload: string }>()
);

export const deselectSupplierVoucher = createAction('[Promo/SupplierVoucher] Deselect Period Target Promo');

/**
 * RESET
 */
export const resetSupplierVoucher = createAction('[Promo/SupplierVoucher Page] Reset SupplierVoucher State');

export const setRefreshStatus = createAction(
    '[Promo/SupplierVoucher Page] Set Refresh Statuse',
    props<{ payload: boolean }>()
);
