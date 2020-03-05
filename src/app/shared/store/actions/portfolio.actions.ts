import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { Portfolio } from 'app/shared/models/portfolio.model';
import { IQueryParams } from 'app/shared/models/query.model';

// -----------------------------------------------------------------------------------------------------
// Fetch Autocomplete [Portfolios]
// -----------------------------------------------------------------------------------------------------

export const searchPortfolioRequest = createAction(
    '[Helper Sources - Portfolio] Search Portfolio Request',
    props<{ payload: IQueryParams }>()
);

export const fetchPortfolioRequest = createAction(
    '[Helper Sources - Portfolio API] Fetch Portfolio Request',
    props<{ payload: IQueryParams }>()
);

export const fetchPortfolioFailure = createAction(
    '[Helper Sources - Portfolio API] Fetch Portfolio Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchPortfolioSuccess = createAction(
    '[Helper Sources - Portfolio API] Fetch Portfolio Success',
    props<{ payload: { data: Array<Portfolio>; total: number } }>()
);

// -----------------------------------------------------------------------------------------------------
// Helper Actions
// -----------------------------------------------------------------------------------------------------

export const clearPortfolioState = createAction(
    '[Helper Sources - Portfolio] Clear Portfolio State'
);
