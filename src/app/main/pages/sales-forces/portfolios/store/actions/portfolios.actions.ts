import { createAction, props } from '@ngrx/store';
import { IErrorHandler, TSource, IQueryParams } from 'app/shared/models';
import { Portfolio } from '../../models/portfolios.model';
import { Store } from 'app/main/pages/attendances/models';

export type requestActionNames =
    'fetchPortfolioRequest' |
    'fetchPortfoliosRequest'
;

export type failureActionNames =
    'fetchPortfolioFailure' |
    'fetchPortfoliosFailure'
;

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

/** PORTFOLIO'S STORE */
export const fetchPortfolioStoresRequest = createAction(
    '[Portfolios API] Fetch Portfolio Store Request',
    props<{ payload: IQueryParams }>()
);

export const fetchPortfolioStoresFailure = createAction(
    '[Portfolios API] Fetch Portfolio Store Failure',
    props<{ payload: IErrorHandler }>()
);
    
export const fetchPortfolioStoresSuccess = createAction(
    '[Portfolios API] Fetch Portfolio Store Success',
    props<{ payload: { stores?: Array<Store>; source: TSource } }>()
);

/** PORTFOLIOS */
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
    props<{ payload: { portfolios?: Array<Portfolio>; source: TSource, total?: number } }>()
);

export const exportPortfoliosRequest = createAction('[Portfolios API] Export Portfolios Request');

export const exportPortfoliosFailure = createAction(
    '[Portfolios API] Export Portfolios Failure',
    props<{ payload: IErrorHandler }>()
);

export const exportPortfoliosSuccess = createAction(
    '[Portfolios API] Export Portfolios Success',
    props<{ payload: string }>()
);

/**
 * HELPER
 */
export const truncatePortfolios = createAction('[Portfolios Page] Truncate Portfolios');
