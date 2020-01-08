import { createAction, props } from '@ngrx/store';
import { IErrorHandler, TSource, IQueryParams } from 'app/shared/models';
import { Portfolio, IPortfolioAddForm } from '../../models/portfolios.model';
import { Store } from 'app/main/pages/attendances/models';
import { Update } from '@ngrx/entity';

export type requestActionNames =
    'exportPortfoliosRequest' |
    'fetchPortfolioRequest' |
    'fetchPortfoliosRequest'
;

export type failureActionNames =
    'createPortfolioFailure' |
    'patchPortfolioFailure' |
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

export const addSelectedPortfolios = createAction(
    '[Portfolios Page] Add Selected Portfolios',
    props<{ payload: Array<string> }>()
);

export const setSelectedPortfolios = createAction(
    '[Portfolios Page] Set Selected Portfolios',
    props<{ payload: Array<string> }>()
);

export const truncateSelectedPortfolios = createAction('[Portfolios Page] Truncate Selected Portfolios');

export const truncatePortfolioStores = createAction('[Portfolios Page] Truncate All of Portfolio Stores');

/** PATCH PORTFOLIO */

export const patchPortfolioRequest = createAction(
    '[Portfolios API] Patch Portfolio Request',
    props<{ payload: { id: string; portfolio: IPortfolioAddForm } }>()
);

export const patchPortfolioFailure = createAction(
    '[Portfolios API] Patch Portfolio Failure',
    props<{ payload: IErrorHandler }>()
);
    
export const patchPortfolioSuccess = createAction(
    '[Portfolios API] Patch Portfolio Success',
    props<{ payload: Portfolio }>()
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

export const updateStore = createAction(
    '[Portfolios] Update Store',
    props<{ payload: Update<Store> }>()
)

export const addSelectedStores = createAction(
    '[Portfolios Page] Add Selected Portfolio Stores',
    props<{ payload: Array<Store> }>()
);

export const removeSelectedStores = createAction(
    '[Portfolios Page] Remove Selected Portfolio Stores',
    props<{ payload: Array<string> }>()
);

export const markStoreAsRemovedFromPortfolio = createAction(
    '[Portfolios Page] Mark Store as Removed from Portfolio',
    props<{ payload: string }>()
);

export const markStoresAsRemovedFromPortfolio = createAction(
    '[Portfolios Page] Mark Stores as Removed from Portfolio',
    props<{ payload: Array<string> }>()
);

export const abortStoreAsRemovedFromPortfolio = createAction(
    '[Portfolios Page] Abort Store as Removed from Portfolio',
    props<{ payload: string }>()
);

export const abortStoresAsRemovedFromPortfolio = createAction(
    '[Portfolios Page] Abort Stores as Removed from Portfolio',
    props<{ payload: Array<string> }>()
);

export const setSelectedInvoiceGroupId = createAction(
    '[Portfolios Page] Set Selected Invoice Group ID',
    props<{ payload: string }>()
);

export const resetSelectedInvoiceGroupId = createAction('[Portfolios Page] Reset Selected Invoice Group ID');

export const confirmRemoveAllSelectedStores = createAction('[Portfolios Page] Confirm to Remove All Selected Stores');

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
