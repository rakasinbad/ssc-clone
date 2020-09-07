import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

import { Portfolio } from '../../models';

export type failureActionNames =
    'fetchPortfoliosFailure';

/**
 * PORTFOLIOS - FETCH
 */

export const fetchPortfoliosRequest = createAction(
    '[Associations/Portfolios API] Fetch Portfolios Request',
    props<{ payload: IQueryParams }>()
);

export const fetchPortfoliosFailure = createAction(
    '[Associations/Portfolios API] Fetch Portfolios Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchPortfoliosSuccess = createAction(
    '[Associations/Portfolios API] Fetch Portfolios Success',
    props<{ payload: { data: Array<Portfolio>; total: number } }>()
);

// ----------------------------

export const clearState = createAction('[Associations Page/Portfolio State] Reset Core State');
