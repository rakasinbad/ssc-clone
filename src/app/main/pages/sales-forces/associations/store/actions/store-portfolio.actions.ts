import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

import { StorePortfolio } from '../../models';

export type failureActionNames =
    'fetchStorePortfoliosFailure';

// -----------------------------------------------------------------------------------------------------
// Fetch Store Portfolios
// -----------------------------------------------------------------------------------------------------

export const fetchStorePortfoliosRequest = createAction(
    '[Associations/Store Portfolios API] Fetch Store Portfolios Request',
    props<{ payload: IQueryParams }>()
);

export const fetchStorePortfoliosFailure = createAction(
    '[Associations/Store Portfolios API] Fetch Store Portfolios Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchStorePortfoliosSuccess = createAction(
    '[Associations/Store Portfolios API] Fetch Store Portfolios Success',
    props<{ payload: { data: Array<StorePortfolio>; total: number } }>()
);

export const clearState = createAction('[Associations Page/Store Portfolio State] Reset Core State');
