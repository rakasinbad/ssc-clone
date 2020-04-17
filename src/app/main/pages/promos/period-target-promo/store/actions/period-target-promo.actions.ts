import { createAction, props } from '@ngrx/store';
import { PeriodTargetPromo } from '../../models';
import { IQueryParams } from 'app/shared/models/query.model';
import { IErrorHandler, TNullable } from 'app/shared/models/global.model';
import { PeriodTargetPromoPayload } from '../../models/period-target-promo.model';
import { EntityPayload } from 'app/shared/models/entity-payload.model';
// import { PeriodTargetPromoCreationPayload } from '../../models/period-target-promo.model';

export type requestActionNames =
    | 'fetchPeriodTargetPromoRequest'
    | 'addPeriodTargetPromoRequest'
    | 'updatePeriodTargetPromoRequest'
    | 'removePeriodTargetPromoRequest';

export type failureActionNames =
    | 'fetchPeriodTargetPromoFailure'
    | 'addPeriodTargetPromoFailure'
    | 'updatePeriodTargetPromoFailure'
    | 'removePeriodTargetPromoFailure';

/**
 * FETCH DATA
 */

export const fetchPeriodTargetPromoRequest = createAction(
    '[Promo/Period Target Promo API] Fetch PeriodTargetPromo Request',
    props<{ payload: IQueryParams | string }>()
);

export const fetchPeriodTargetPromoFailure = createAction(
    '[Promo/Period Target Promo API] Fetch PeriodTargetPromo Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchPeriodTargetPromoSuccess = createAction(
    '[Promo/Period Target Promo API] Fetch PeriodTargetPromo Success',
    props<{ payload: { data: PeriodTargetPromo | Array<PeriodTargetPromo>; total?: number } }>()
);

/**
 * CONFIRMATION
 */

export const confirmAddPeriodTargetPromo = createAction(
    '[PeriodTargetPromo Page] Confirm Add PeriodTargetPromo',
    props<{ payload: PeriodTargetPromo }>()
);

export const confirmUpdatePeriodTargetPromo = createAction(
    '[PeriodTargetPromo Page] Confirm Update PeriodTargetPromo',
    props<{ payload: PeriodTargetPromo }>()
);

export const confirmSetActivePeriodTargetPromo = createAction(
    '[PeriodTargetPromo Page] Confirm Set to Active PeriodTargetPromo',
    props<{ payload: PeriodTargetPromo }>()
);

export const confirmSetInactivePeriodTargetPromo = createAction(
    '[PeriodTargetPromo Page] Confirm Set to Inactive PeriodTargetPromo',
    props<{ payload: PeriodTargetPromo }>()
);

export const confirmRemovePeriodTargetPromo = createAction(
    '[PeriodTargetPromo Page] Confirm Remove PeriodTargetPromo',
    props<{ payload: PeriodTargetPromo | Array<PeriodTargetPromo> }>()
);

/**
 * CREATE (ADD)
 */
export const addPeriodTargetPromoRequest = createAction(
    '[Promo/Period Target Promo API] Add PeriodTargetPromo Request',
    props<{ payload: PeriodTargetPromoPayload }>()
);

export const addPeriodTargetPromoSuccess = createAction(
    '[Promo/Period Target Promo API] Add PeriodTargetPromo Success',
    props<{ payload: TNullable<PeriodTargetPromo> }>()
);

export const addPeriodTargetPromoFailure = createAction(
    '[Promo/Period Target Promo API] Add PeriodTargetPromo Failure',
    props<{ payload: IErrorHandler }>()
);
// 
/**
 * UPDATE
 */
export const updatePeriodTargetPromoRequest = createAction(
    '[Promo/Period Target Promo API] Update PeriodTargetPromo Request',
    props<{ payload: EntityPayload<Partial<PeriodTargetPromo>> }>()
);

export const updatePeriodTargetPromoSuccess = createAction(
    '[Promo/Period Target Promo API] Update PeriodTargetPromo Success',
    props<{ payload: { id: string; data: PeriodTargetPromo } }>()
);

export const updatePeriodTargetPromoFailure = createAction(
    '[Promo/Period Target Promo API] Update PeriodTargetPromo Failure',
    props<{ payload: IErrorHandler }>()
);

/**
 * REMOVE (DELETE)
 */
export const removePeriodTargetPromoRequest = createAction(
    '[Promo/Period Target Promo API] Remove PeriodTargetPromo Request',
    props<{ payload: string }>()
);

export const removePeriodTargetPromoSuccess = createAction(
    '[Promo/Period Target Promo API] Remove PeriodTargetPromo Success',
    props<{ payload: { id: string; data: PeriodTargetPromo } }>()
);

export const removePeriodTargetPromoFailure = createAction(
    '[Promo/Period Target Promo API] Remove PeriodTargetPromo Failure',
    props<{ payload: IErrorHandler }>()
);

/**
 * SELECTION
 */
export const selectPeriodTargetPromo = createAction(
    '[Promo/Period Target Promo] Select Period Target Promo',
    props<{ payload: string }>()
);

export const deselectPeriodTargetPromo = createAction('[Promo/Period Target Promo] Deselect Period Target Promo');

/**
 * RESET
 */
export const resetPeriodTargetPromo = createAction('[Promo/Period Target Promo Page] Reset PeriodTargetPromo State');

export const setRefreshStatus = createAction(
    '[Promo/Period Target Promo Page] Set Refresh Statuse',
    props<{ payload: boolean }>()
);
