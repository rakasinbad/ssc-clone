import { createAction, props } from '@ngrx/store';
import { ErrorHandler, EStatus } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { Update } from '@ngrx/entity';

import { PromoHierarchy, PromoHierarchyPayload } from '../../models';

// -----------------------------------------------------------------------------------------------------
// Fetch Promo Hierarchy List
// -----------------------------------------------------------------------------------------------------

export const fetchPromoHierarchyRequest = createAction(
    '[Promo Hierarchy API] Fetch Promo Hierarchy List Request',
    props<{ payload: IQueryParams}>()
);

export const fetchPromoHierarchyFailure = createAction(
    '[Promo Hierarchy API] Fetch Promo Hierarchy List Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchPromoHierarchySuccess = createAction(
    '[Promo Hierarchy API] Fetch Promo Hierarchy List Success',
    props<{ payload: { data: PromoHierarchy[]; total: number } }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Promo Hierarchy for detail
// -----------------------------------------------------------------------------------------------------

export const fetchPromoHierarchyDetailRequest = createAction(
    '[Promo Hierarchy API] Fetch Detail Promo Hierarchy Request',
    props<{ payload: { id: string, parameter?: IQueryParams } }>()
);

export const fetchPromoHierarchyDetailFailure = createAction(
    '[Promo Hierarchy API] Fetch Detail Promo Hierarchy Request Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchPromoHierarchyDetailSuccess = createAction(
    '[Promo Hierarchy API] Fetch Detail Promo Hierarchy Request Success',
    props<{ payload: PromoHierarchy }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - CHANGE SET PROMO] Promo Hierarchy
// -----------------------------------------------------------------------------------------------------

export const updatePromoHierarchyRequest = createAction(
    '[Promo Hierarchy API] Update Promo Hierarchy Request',
    props<{ payload: { body: PromoHierarchyPayload }}>()
);

export const updatePromoHierarchySuccess = createAction(
    '[Promo Hierarchy API] Update Promo Hierarchy Success',
    props<{ payload: Update<PromoHierarchy> }>()
);

export const updatePromoHierarchyFailure = createAction(
    '[Promo Hierarchy API] Update Promo Hierarchy Failure',
    props<{ payload: ErrorHandler }>()
);


export const setRefreshStatus = createAction(
    '[Promo Hierarchy Page] Set Refresh Statuse',
    props<{ payload: boolean }>()
);

export const clearState = createAction('[Promo Hierarchy Page] Reset Promo Hierarchy Core State');

export type FailureActions =
    | 'fetchPromoHierarchyFailure'
    | 'fetchPromoHierarchyDetailFailure'
    | 'updatePromoHierarchyFailure'
