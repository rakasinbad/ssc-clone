import { createAction, props } from '@ngrx/store';
import { Voucher } from '../../models';
import { IQueryParams } from 'app/shared/models/query.model';
import { IErrorHandler, TNullable } from 'app/shared/models/global.model';
import { VoucherPayload } from '../../models/voucher.model';
import { EntityPayload } from 'app/shared/models/entity-payload.model';
// import { VoucherCreationPayload } from '../../models/voucher.model';

export type requestActionNames =
    | 'fetchVoucherRequest'
    | 'addVoucherRequest'
    | 'updateVoucherRequest'
    | 'removeVoucherRequest';

export type failureActionNames =
    | 'fetchVoucherFailure'
    | 'addVoucherFailure'
    | 'updateVoucherFailure'
    | 'removeVoucherFailure';

/**
 * FETCH DATA
 */

export const fetchVoucherRequest = createAction(
    '[Promo/Voucher API] Fetch Voucher Request',
    props<{ payload: IQueryParams | string }>()
);

export const fetchVoucherFailure = createAction(
    '[Promo/Voucher API] Fetch Voucher Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchVoucherSuccess = createAction(
    '[Promo/Voucher API] Fetch Voucher Success',
    props<{ payload: { data: Voucher | Array<Voucher>; total?: number } }>()
);

/**
 * CONFIRMATION
 */

export const confirmAddVoucher = createAction(
    '[Voucher Page] Confirm Add Voucher',
    props<{ payload: Voucher }>()
);

export const confirmUpdateVoucher = createAction(
    '[Voucher Page] Confirm Update Voucher',
    props<{ payload: Voucher }>()
);

export const confirmSetActiveVoucher = createAction(
    '[Voucher Page] Confirm Set to Active Voucher',
    props<{ payload: Voucher }>()
);

export const confirmSetInactiveVoucher = createAction(
    '[Voucher Page] Confirm Set to Inactive Voucher',
    props<{ payload: Voucher }>()
);

export const confirmRemoveVoucher = createAction(
    '[Voucher Page] Confirm Remove Voucher',
    props<{ payload: Voucher | Array<Voucher> }>()
);

/**
 * CREATE (ADD)
 */
export const addVoucherRequest = createAction(
    '[Promo/Voucher API] Add Voucher Request',
    props<{ payload: VoucherPayload }>()
);

export const addVoucherSuccess = createAction(
    '[Promo/Voucher API] Add Voucher Success',
    props<{ payload: TNullable<Voucher> }>()
);

export const addVoucherFailure = createAction(
    '[Promo/Voucher API] Add Voucher Failure',
    props<{ payload: IErrorHandler }>()
);
//
/**
 * UPDATE
 */
export const updateVoucherRequest = createAction(
    '[Promo/Voucher API] Update Voucher Request',
    props<{ payload: EntityPayload<Partial<Voucher>> }>()
);

export const updateVoucherSuccess = createAction(
    '[Promo/Voucher API] Update Voucher Success',
    props<{ payload: { id: string; data: Voucher } }>()
);

export const updateVoucherFailure = createAction(
    '[Promo/Voucher API] Update Voucher Failure',
    props<{ payload: IErrorHandler }>()
);

/**
 * REMOVE (DELETE)
 */
export const removeVoucherRequest = createAction(
    '[Promo/Voucher API] Remove Voucher Request',
    props<{ payload: string }>()
);

export const removeVoucherSuccess = createAction(
    '[Promo/Voucher API] Remove Voucher Success',
    props<{ payload: { id: string; data: Voucher } }>()
);

export const removeVoucherFailure = createAction(
    '[Promo/Voucher API] Remove Voucher Failure',
    props<{ payload: IErrorHandler }>()
);

/**
 * SELECTION
 */
export const selectVoucher = createAction(
    '[Promo/Voucher] Select Period Target Promo',
    props<{ payload: string }>()
);

export const deselectVoucher = createAction('[Promo/Voucher] Deselect Period Target Promo');

/**
 * RESET
 */
export const resetVoucher = createAction('[Promo/Voucher Page] Reset Voucher State');

export const setRefreshStatus = createAction(
    '[Promo/Voucher Page] Set Refresh Statuse',
    props<{ payload: boolean }>()
);
