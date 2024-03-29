import { createAction, props } from '@ngrx/store';
import { SkuAssignments } from '../../models';
import { IQueryParams } from 'app/shared/models/query.model';
import { IErrorHandler, TNullable } from 'app/shared/models/global.model';
import { Catalogue } from 'app/main/pages/catalogues/models';
import { SkuAssignmentsCreationPayload } from '../../models/sku-assignments.model';
import { Warehouse } from '../../../warehouse-coverages/models/warehouse-coverage.model';

export type requestActionNames =
    | 'fetchSkuAssignmentsRequest'
    | 'addSkuAssignmentsRequest'
    | 'updateSkuAssignmentsRequest'
    | 'removeSkuAssignmentsRequest';

export type failureActionNames =
    | 'fetchSkuAssignmentsFailure'
    | 'addSkuAssignmentsFailure'
    | 'updateSkuAssignmentsFailure'
    | 'removeSkuAssignmentsFailure';

/**
 * FETCH DATA
 */

export const fetchSkuAssignmentsRequest = createAction(
    '[SkuAssignments API] Fetch SkuAssignments Request',
    props<{ payload: IQueryParams }>()
);

export const fetchSkuAssignmentsFailure = createAction(
    '[SkuAssignments API] Fetch SkuAssignments Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchSkuAssignmentsSuccess = createAction(
    '[SkuAssignments API] Fetch SkuAssignments Success',
    props<{ payload: { data: Array<SkuAssignments>; total: number } }>()
);

/**
 * CONFIRMATION
 */

export const confirmAddSkuAssignments = createAction(
    '[SkuAssignments Page] Confirm Add SkuAssignments',
    props<{ payload: SkuAssignments }>()
);

export const confirmUpdateSkuAssignments = createAction(
    '[SkuAssignments Page] Confirm Update SkuAssignments',
    props<{ payload: SkuAssignments }>()
);

export const confirmRemoveSkuAssignments = createAction(
    '[SkuAssignments Page] Confirm Remove SkuAssignments',
    props<{ payload: Array<string> }>()
);

/**
 * CREATE (ADD)
 */
export const addSkuAssignmentsRequest = createAction(
    '[SkuAssignments API] Add SkuAssignments Request',
    props<{ payload: SkuAssignmentsCreationPayload }>()
);

export const addSkuAssignmentsSuccess = createAction(
    '[SkuAssignments API] Add SkuAssignments Success',
    props<{ payload: TNullable<SkuAssignments> }>()
);

export const addSkuAssignmentsFailure = createAction(
    '[SkuAssignments API] Add SkuAssignments Failure',
    props<{ payload: IErrorHandler }>()
);

/**
 * UPDATE
 */
export const updateSkuAssignmentsRequest = createAction(
    '[SkuAssignments API] Update SkuAssignments Request',
    props<{ payload: { id: string; data: SkuAssignments } }>()
);

export const updateSkuAssignmentsSuccess = createAction(
    '[SkuAssignments API] Update SkuAssignments Success',
    props<{ payload: { id: string; data: SkuAssignments } }>()
);

export const updateSkuAssignmentsFailure = createAction(
    '[SkuAssignments API] Update SkuAssignments Failure',
    props<{ payload: IErrorHandler }>()
);

/**
 * REMOVE (DELETE)
 */
export const removeSkuAssignmentsRequest = createAction(
    '[SkuAssignments API] Remove SkuAssignments Request',
    props<{ payload: string }>()
);

export const removeSkuAssignmentsSuccess = createAction(
    '[SkuAssignments API] Remove SkuAssignments Success',
    props<{ payload: { id: string; data: SkuAssignments } }>()
);

export const removeSkuAssignmentsFailure = createAction(
    '[SkuAssignments API] Remove SkuAssignments Failure',
    props<{ payload: IErrorHandler }>()
);

export const selectWarehouse = createAction(
    '[Warehouse/SkuAssignments] Select Warehouse',
    props<{ payload: Warehouse }>()
);

export const deselectWarehouse = createAction('[Warehouse/SkuAssignments] Deselect Warehouse');

/**
 * FOR HANDLE SELECT SKU TO WAREHOUSE
 */

export const addSelectedCatalogues = createAction(
    '[Catalogues Page] Add Selected Catalogues',
    props<{ payload: Array<Catalogue> }>()
);

export const removeSelectedCatalogues = createAction(
    '[Catalogues Page] Remove Selected Catalogues',
    props<{ payload: Array<string> }>()
);

export const markCatalogueAsRemovedFromWarehouse = createAction(
    '[Catalogues Page] Mark Catalogue as Removed from Warehouse',
    props<{ payload: string }>()
);

export const markCataloguesAsRemovedFromWarehouse = createAction(
    '[Catalogues Page] Mark Catalogues as Removed from Warehouse',
    props<{ payload: Array<string> }>()
);

export const abortCatalogueAsRemovedFromWarehouse = createAction(
    '[Catalogues Page] Abort Catalogue as Removed from Warehouse',
    props<{ payload: string }>()
);

export const abortCataloguesAsRemovedFromWarehouse = createAction(
    '[Catalogues Page] Abort Catalogues as Removed from Warehouse',
    props<{ payload: Array<string> }>()
);

/**
 * RESET
 */
export const resetSkuAssignments = createAction('[SkuAssignments Page] Reset SkuAssignments State');
