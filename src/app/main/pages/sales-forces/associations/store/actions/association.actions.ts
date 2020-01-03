import { createAction, props } from '@ngrx/store';
import { ErrorHandler, IQueryParams } from 'app/shared/models';
import { AssociationPortfolio } from '../../models';

/**
 * ASSOCIATIONS
 */

export const fetchAssociationPortfoliosRequest = createAction(
    '[Associations Portfolios API] Fetch Association Portfolios Request',
    props<{ payload: IQueryParams }>()
);

export const fetchAssociationPortfoliosFailure = createAction(
    '[Associations Portfolios API] Fetch Association Portfolios Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchAssociationPortfoliosSuccess = createAction(
    '[Associations Portfolios API] Fetch Association Portfolios Success',
    props<{ payload: { data: Array<AssociationPortfolio>; total: number } }>()
);

export const clearPortfolioState = createAction('[Association Portfolios Page] Reset Core State');
