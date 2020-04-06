import { createAction, props } from '@ngrx/store';
import { FlexiComboList } from '../../models';
import { IQueryParams } from 'app/shared/models/query.model';
import { IErrorHandler } from 'app/shared/models/global.model';

export type requestActionNames = 'fetchFlexiComboListRequest';

export type failureActionNames = 'fetchFlexiComboListFailure';

/**
 * FETCH DATA
 */

export const fetchFlexiComboListRequest = createAction(
    '[FlexiComboList API] Fetch FlexiComboList Request',
    props<{ payload: IQueryParams }>()
);

export const fetchFlexiComboListFailure = createAction(
    '[FlexiComboList API] Fetch FlexiComboList Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchFlexiComboListSuccess = createAction(
    '[FlexiComboList API] Fetch FlexiComboList Success',
    props<{ payload: { data: Array<FlexiComboList>; total: number } }>()
);

/**
 * RESET
 */
export const resetFlexiComboList = createAction('[FlexiComboList Page] Reset FlexiComboList State');

export const setSearchValue = createAction(
    '[FlexiComboList PAGE] Set Search Value',
    props<{ payload: string }>()
);
