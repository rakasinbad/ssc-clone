import { createAction, props } from '@ngrx/store';
import { ErrorHandler, EStatus } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { Update } from '@ngrx/entity';

import { CreateCrossSellingDto, CrossSelling, PatchCrossSellingDto } from '../../models';

// -----------------------------------------------------------------------------------------------------
// Fetch Cross Selling Promos
// -----------------------------------------------------------------------------------------------------

export const fetchCrossSellingPromoListRequest = createAction(
    '[Cross Selling Promo] Fetch Cross Selling Promo List Request',
    props<{ payload: IQueryParams }>()
);

export const fetchCrossSellingPromoListFailure = createAction(
    '[Cross Selling Promo] Fetch Cross Selling Promo List Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchCrossSellingPromoListSuccess = createAction(
    '[Cross Selling Promo] Fetch Cross Selling Promo List Success',
    props<{ payload: { data: CrossSelling[]; total: number } }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Cross Selling Promo for detail
// -----------------------------------------------------------------------------------------------------

export const fetchCrossSellingPromoDetailRequest = createAction(
    '[Cross Selling Promo] Fetch Cross Selling Promo Detail Request',
    props<{ payload: { id: string, parameter?: IQueryParams } }>()
);

export const fetchCrossSellingPromoDetailFailure = createAction(
    '[Cross Selling Promo] Fetch Cross Selling Promo Detail Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchCrossSellingPromoDetailSuccess = createAction(
    '[Cross Selling Promo] Fetch Cross Selling Promo Detail Success',
    props<{ payload: CrossSelling }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - CREATE] Cross Selling Promo
// -----------------------------------------------------------------------------------------------------

export const createCrossSellingPromoRequest = createAction(
    '[Cross Selling Promo] Create Cross Selling Promo Request',
    props<{ payload: CreateCrossSellingDto }>()
);

export const createCrossSellingPromoFailure = createAction(
    '[Cross Selling Promo] Create Cross Selling Promo Failure',
    props<{ payload: ErrorHandler }>()
);

export const createCrossSellingPromoSuccess = createAction('[Cross Selling Promo] Create Cross Selling Promo Success');

// -----------------------------------------------------------------------------------------------------
// [CRUD - DELETE] Cross Selling
// -----------------------------------------------------------------------------------------------------

export const confirmDeleteCrossSellingPromo = createAction(
    '[Cross Selling] Confirm Cross Selling Promo Combo',
    props<{ payload: CrossSelling }>()
);

export const deleteCrossSellingPromoRequest = createAction(
    '[Cross Selling] Delete Cross Selling Promo Request',
    props<{ payload: string }>()
);

export const deleteCrossSellingPromoFailure = createAction(
    '[Cross Selling] Delete Cross Selling Promo Failure',
    props<{ payload: ErrorHandler }>()
);

export const deleteCrossSellingPromoSuccess = createAction(
    '[Cross Selling] Delete Cross Selling Promo Success',
    props<{ payload: string }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - CHANGE STATUS] Cross Selling
// -----------------------------------------------------------------------------------------------------

export const confirmChangeStatus = createAction(
    '[Cross Selling] Confirm Change Status',
    props<{ payload: CrossSelling }>()
);

export const changeStatusRequest = createAction(
    '[Cross Selling] Change Status Request',
    props<{ payload: { body: EStatus; id: string } }>()
);

export const changeStatusFailure = createAction(
    '[Cross Selling] Change Status Failure',
    props<{ payload: ErrorHandler }>()
);

export const changeStatusSuccess = createAction(
    '[Cross Selling] Change Status Success',
    props<{ payload: Update<CrossSelling> }>()
);

export const clearState = createAction('[Cross Selling] Reset Cross Selling Promo Core State');

export type FailureActions =
    | 'fetchCrossSellingPromoListFailure'
    | 'fetchCrossSellingPromoDetailFailure'
    | 'createCrossSellingPromoFailure'
    // | 'updateCrossSellingPromoFailure'
    | 'deleteCrossSellingPromoFailure'
    | 'changeStatusFailure';
