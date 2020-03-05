import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

import { Portfolio } from '../../../portfolios/models';

export type failureActionNames = 'fetchAssociatedPortfoliosFailure';

/**
 * ASSOCIATIONS
 */

export const fetchAssociatedPortfoliosRequest = createAction(
    '[Portfolios API] Fetch Associated Portfolios Request',
    props<{ payload: IQueryParams }>()
);

export const fetchAssociatedPortfoliosFailure = createAction(
    '[Portfolios API] Fetch Associated Portfolios Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchAssociatedPortfoliosSuccess = createAction(
    '[Portfolios API] Fetch Associated Portfolios Success',
    props<{ payload: { data: Array<Portfolio>; total: number } }>()
);

export const addSelectedPortfolios = createAction(
    '[Associations] Add Selected Portfolios',
    props<{ payload: Array<Portfolio> }>()
);

export const removeSelectedPortfolios = createAction(
    '[Associations] Remove Selected Portfolios',
    props<{ payload: Array<string> }>()
);

export const markPortfolioAsRemoved = createAction(
    '[Associations Page] Mark Portfolio as Removed',
    props<{ payload: Array<string> }>()
);

export const abortPortfolioAsRemoved = createAction(
    '[Associations Page] Abort to Mark Portfolio as Removed',
    props<{ payload: Array<string> }>()
);

export const markInitialized = createAction('[Associations] Mark as Initialized');

export const abortInitialized = createAction('[Associations] Abort as Initialized');

export const confirmToClearAssociatedPortfolios = createAction(
    '[Associations Page] Confirm to Clear Associated Portfolios'
);

export const clearAssociatedPortfolios = createAction(
    '[Associations Page] Clear Associated Portfolios'
);
// export const clearStoreState = createAction('[Association Page] Reset Core State');
