import { createAction, props } from '@ngrx/store';
import { PromoHierarchy } from '../../models';
import { IQueryParamsVoucher, IQueryParams } from 'app/shared/models/query.model';
import { IErrorHandler, TNullable } from 'app/shared/models/global.model';
import { PromoHierarchyPayload, PromoHierarchyDetail } from '../../models/promo-hierarchy.model';
import { Update } from '@ngrx/entity';

export type requestActionNames =
    | 'fetchPromoHierarchyRequest'
    | 'updatePromoHierarchyRequest'
    | 'fetchPromoHierarchyDetailRequest'

export type failureActionNames =
    | 'fetchPromoHierarchyFailure'
    | 'updatePromoHierarchyFailure'
    | 'fetchPromoHierarchyDetailFailure'

/**
 * FETCH DATA
 */

export const fetchPromoHierarchyRequest = createAction(
    '[Promo Hierarchy API] Fetch Promo Hierarchy Request',
    props<{ payload: IQueryParams}>()
);

export const fetchPromoHierarchyFailure = createAction(
    '[Promo Hierarchy API] Fetch Promo Hierarchy Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchPromoHierarchySuccess = createAction(
    '[Promo Hierarchy API] Fetch Promo Hierarchy Success',
    props<{ payload: { data: PromoHierarchy[]; total: number } }>()
);

/**
 * CONFIRMATION
 */

export const confirmAddPromoHierarchy = createAction(
    '[Promo Hierarchy Page] Confirm Add Promo Hierarchy',
    props<{ payload: PromoHierarchy }>()
);

export const confirmUpdatePromoHierarchy = createAction(
    '[Promo Hierarchy Page] Confirm Update Promo Hierarchy',
    props<{ payload: PromoHierarchy }>()
);

export const confirmSetActivePromoHierarchy = createAction(
    '[Promo Hierarchy Page] Confirm Set to Active Promo Hierarchy',
    props<{ payload: PromoHierarchy }>()
);

export const confirmSetInactivePromoHierarchy = createAction(
    '[Promo Hierarchy Page] Confirm Set to Inactive Promo Hierarchy',
    props<{ payload: PromoHierarchy }>()
);

export const confirmRemovePromoHierarchy = createAction(
    '[Promo Hierarchy Page] Confirm Remove Promo Hierarchy',
    props<{ payload: PromoHierarchy | Array<PromoHierarchy> }>()
);


/**
 * Fetch Detail Promo Hierarchy
 */

export const fetchPromoHierarchyDetailRequest = createAction(
    '[Promo Hierarchy API] Fetch Detail Promo Hierarchy Request',
    props<{ payload: { id: string, parameter?: IQueryParams } }>()
);

export const fetchPromoHierarchyDetailFailure = createAction(
    '[Promo Hierarchy API] Fetch Detail Promo Hierarchy Request Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchPromoHierarchyDetailSuccess = createAction(
    '[Promo Hierarchy API] Fetch Detail Promo Hierarchy Request Success',
    props<{ payload: PromoHierarchy }>()
);



/**
 * UPDATE
 */
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
    props<{ payload: IErrorHandler }>()
);

// /**
//  * REMOVE (DELETE)
//  */
export const removePromoHierarchyRequest = createAction(
    '[Promo Hierarchy API] Remove Promo Hierarchy Request',
    props<{ payload: string }>()
);

export const removePromoHierarchySuccess = createAction(
    '[Promo Hierarchy API] Remove Promo Hierarchy Success',
    props<{ payload: string }>()
);

export const removePromoHierarchyFailure = createAction(
    '[Promo Hierarchy API] Remove Promo Hierarchy Failure',
    props<{ payload: IErrorHandler }>()
);

/**
 * SELECTION
 */
export const selectPromoHierarchy = createAction(
    '[Promo/Promo Hierarchy] Select Promo Hierarchy',
    props<{ payload: string }>()
);

export const deselectPromoHierarchy = createAction('[Promo Hierarchy Page] Deselect Promo Hierarchy');

/**
 * RESET
 */
export const resetPromoHierarchy = createAction('[Promo Hierarchy Page] Reset Promo Hierarchy State');

export const setRefreshStatus = createAction(
    '[Promo Hierarchy Page] Set Refresh Statuse',
    props<{ payload: boolean }>()
);
