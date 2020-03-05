import { createAction, props } from '@ngrx/store';
import { IErrorHandler, TSource } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { Store } from 'app/shared/models/store.model';

export type failureActionNames = 'fetchStoreFailure' | 'fetchStoresFailure';

// export const addSelectedPortfolios = createAction(
//     '[Portfolios] Add Selected Portfolios',
//     props<{ payload: Array<string> }>()
// );

// export const removeSelectedPortfolios = createAction(
//     '[Portfolios] Remove Selected Portfolio',
//     props<{ payload: Array<string> }>()
// );

// export const setSearchKeywordPortfolio = createAction(
//     '[Portfolios Page] Set Search Keyword Portfolios',
//     props<{ payload: string }>()
// );

// export const setSelectedPortfolios = createAction(
//     '[Portfolios Page] Set Selected Portfolios',
//     props<{ payload: Array<string> }>()
// );

// export const resetSearchKeywordPortfolio = createAction('[Portfolios] Reset Search Keyword Portfolio');

// export const truncateSelectedPortfolios = createAction('[Portfolios Page] Truncate Selected Portfolios');

// export const truncatePortfolioStores = createAction('[Portfolios Page] Truncate All of Portfolio Stores');

/** PATCH PORTFOLIO */

// export const patchPortfolioRequest = createAction(
//     '[Portfolios API] Patch Portfolio Request',
//     props<{ payload: { id: string; portfolio: IPortfolioAddForm } }>()
// );

// export const patchPortfolioFailure = createAction(
//     '[Portfolios API] Patch Portfolio Failure',
//     props<{ payload: IErrorHandler }>()
// );

// export const patchPortfolioSuccess = createAction(
//     '[Portfolios API] Patch Portfolio Success',
//     props<{ payload: Portfolio }>()
// );

/** CREATE PORTFOLIO */

// export const createPortfolioRequest = createAction(
//     '[Portfolios API] Create Portfolio Request',
//     props<{ payload: IPortfolioAddForm }>()
// );

// export const createPortfolioFailure = createAction(
//     '[Portfolios API] Create Portfolio Failure',
//     props<{ payload: IErrorHandler }>()
// );

// export const createPortfolioSuccess = createAction(
//     '[Portfolios API] Create Portfolio Success',
//     props<{ payload: Portfolio }>()
// );

/** STORE */
export const fetchStoreRequest = createAction(
    '[Associations/Stores API] Fetch Store Request',
    props<{ payload: string }>()
);

export const fetchStoreFailure = createAction(
    '[Associations/Stores API] Fetch Store Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchStoreSuccess = createAction(
    '[Associations/Stores API] Fetch Store Success',
    props<{ payload: { store?: Store; source: TSource } }>()
);

/** STORES */
export const fetchStoresRequest = createAction(
    '[Associations/Stores API] Fetch Stores Request',
    props<{ payload: IQueryParams }>()
);

export const fetchStoresFailure = createAction(
    '[Associations/Stores API] Fetch Stores Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchStoresSuccess = createAction(
    '[Associations/Stores API] Fetch Stores Success',
    props<{ payload: { stores?: Array<Store>; source: TSource; total?: number } }>()
);

export const setSelectedStores = createAction(
    '[Associations/Stores] Set Selected Stores',
    props<{ payload: Array<string> }>()
);

export const addSelectedStores = createAction(
    '[Associations/Stores] Add Selected Stores',
    props<{ payload: Array<Store> }>()
);

export const removeSelectedStores = createAction(
    '[Associations/Stores] Remove Selected Stores',
    props<{ payload: Array<string> }>()
);

export const markStoreAsRemoved = createAction(
    '[Associations/Stores] Mark Store as Removed',
    props<{ payload: string }>()
);

export const markStoresAsRemoved = createAction(
    '[Associations/Stores] Mark Stores as Removed',
    props<{ payload: Array<string> }>()
);

export const abortStoreAsRemoved = createAction(
    '[Associations/Stores] Abort Store as Removed',
    props<{ payload: string }>()
);

export const abortStoresAsRemoved = createAction(
    '[Associations/Stores] Abort Stores as Removed',
    props<{ payload: Array<string> }>()
);

export const confirmRemoveAllSelectedStores = createAction(
    '[Associations/Stores] Confirm to Remove All Selected Stores'
);

/**
 * HELPER
 */
export const truncateStores = createAction('[Associations/Stores] Truncate Stores');
