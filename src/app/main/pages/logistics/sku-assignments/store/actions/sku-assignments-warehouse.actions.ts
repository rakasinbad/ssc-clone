import { createAction, props } from '@ngrx/store';
import { SkuAssignmentsWarehouse } from '../../models';
import { IQueryParams } from 'app/shared/models/query.model';
import { IErrorHandler } from 'app/shared/models/global.model';

export type requestActionNames = 'fetchSkuAssignmentsWarehouseRequest';

export type failureActionNames = 'fetchSkuAssignmentsWarehouseFailure';

/**
 * FETCH DATA
 */

export const fetchSkuAssignmentsWarehouseRequest = createAction(
    '[SkuAssignmentsWarehouse API] Fetch SkuAssignmentsWarehouse Request',
    props<{ payload: IQueryParams }>()
);

export const fetchSkuAssignmentsWarehouseFailure = createAction(
    '[SkuAssignmentsWarehouse API] Fetch SkuAssignmentsWarehouse Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchSkuAssignmentsWarehouseSuccess = createAction(
    '[SkuAssignmentsWarehouse API] Fetch SkuAssignmentsWarehouse Success',
    props<{ payload: { data: Array<SkuAssignmentsWarehouse>; total: number } }>()
);

/**
 * RESET
 */
export const resetSkuAssignmentsWarehouse = createAction(
    '[SkuAssignmentsWarehouse Page] Reset SkuAssignmentsWarehouse State'
);

export const setSearchValue = createAction(
    '[SkuAssignmentsWarehouse PAGE] Set Search Value',
    props<{ payload: string }>()
);
