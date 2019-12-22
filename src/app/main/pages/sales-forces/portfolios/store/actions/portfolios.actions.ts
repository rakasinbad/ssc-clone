import { createAction, props } from '@ngrx/store';
import { IErrorHandler, TSource, IQueryParams } from 'app/shared/models';
import { Portfolio } from '../../models/portfolios.model';

/** PORTFOLIO */
export const fetchPortfolioRequest = createAction(
    '[Portfolios API] Fetch Portfolio Request',
    props<{ payload: string }>()
);

export const fetchPortfolioFailure = createAction(
    '[Portfolios API] Fetch Portfolio Failure',
    props<{ payload: IErrorHandler }>()
);
    
export const fetchPortfolioSuccess = createAction(
    '[Portfolios API] Fetch Portfolio Success',
    props<{ payload: { portfolio?: Portfolio; source: TSource } }>()
);

/** PORTFOLIO */
export const fetchPortfoliosRequest = createAction(
    '[Portfolios API] Fetch Portfolios Request',
    props<{ payload: IQueryParams }>()
);

export const fetchPortfoliosFailure = createAction(
    '[Portfolios API] Fetch Portfolios Failure',
    props<{ payload: IErrorHandler }>()
);
    
export const fetchPortfoliosSuccess = createAction(
    '[Portfolios API] Fetch Portfolios Success',
    props<{ payload: { portfolios?: Array<Portfolio>; source: TSource } }>()
);
