import { createAction, props } from '@ngrx/store';
import { IErrorHandler, IQueryParams } from 'app/shared/models';
import { SkuAssignmentsSku } from '../../models';

export type requestActionNames = 'fetchSkuAssignmentsSkuRequest';

export type failureActionNames = 'fetchSkuAssignmentsSkuFailure';

/**
 * FETCH DATA
 */

export const fetchSkuAssignmentsSkuRequest = createAction(
    '[SkuAssignmentsSku API] Fetch SkuAssignmentsSku Request',
    props<{ payload: IQueryParams }>()
);

export const fetchSkuAssignmentsSkuFailure = createAction(
    '[SkuAssignmentsSku API] Fetch SkuAssignmentsSku Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchSkuAssignmentsSkuSuccess = createAction(
    '[SkuAssignmentsSku API] Fetch SkuAssignmentsSku Success',
    props<{ payload: { data: Array<SkuAssignmentsSku>; total: number } }>()
);

/**
 * RESET
 */
export const resetSkuAssignmentsSku = createAction(
    '[SkuAssignmentsSku Page] Reset SkuAssignmentsSku State'
);

export const setSearchValue = createAction(
    '[SkuAssignmentsSku PAGE] Set Search Value',
    props<{ payload: string }>()
);
