import { createAction, props } from '@ngrx/store';
import { IErrorHandler, TSource, IQueryParams } from 'app/shared/models';
import { Portfolio, IPortfolioAddForm } from '../../models/portfolios.model';
import { Store } from 'app/main/pages/attendances/models';

export type requestActionNames =
    'exportPortfoliosRequest' |
    'fetchPortfolioRequest' |
    'fetchPortfoliosRequest'
;

export type failureActionNames =
    'createPortfolioFailure' |
    'exportPortfoliosFailure' |
    'fetchPortfolioFailure' |
    'fetchPortfoliosFailure' |
    'fetchPortfolioStoresFailure'
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

/** CREATE PORTFOLIO */

export const createPortfolioRequest = createAction(
    '[Portfolios API] Create Portfolio Request',
    props<{ payload: IPortfolioAddForm }>()
);

export const createPortfolioFailure = createAction(
    '[Portfolios API] Create Portfolio Failure',
    props<{ payload: IErrorHandler }>()
);
    
export const createPortfolioSuccess = createAction(
    '[Portfolios API] Create Portfolio Success',
    props<{ payload: Portfolio }>()
);

/** PORTFOLIO'S STORE */
export const fetchPortfolioStoresRequest = createAction(
    '[Portfolios API] Fetch Portfolio Stores Request',
    props<{ payload: IQueryParams }>()
);

export const fetchPortfolioStoresFailure = createAction(
    '[Portfolios API] Fetch Portfolio Stores Failure',
    props<{ payload: IErrorHandler }>()
);
    
export const fetchPortfolioStoresSuccess = createAction(
    '[Portfolios API] Fetch Portfolio Stores Success',
    props<{ payload: { stores?: Array<Store>; source: TSource; total?: number } }>()
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
    props<{ payload: { portfolios?: Array<Portfolio>; source: TSource; total?: number } }>()
);

export const addSelectedStores = createAction(
    '[Portfolios Page] Add Selected Portfolio Stores',
    props<{ payload: Array<Store> }>()
);

export const removeSelectedStores = createAction(
    '[Portfolios Page] Remove Selected Portfolio Stores',
    props<{ payload: Array<string> }>()
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
