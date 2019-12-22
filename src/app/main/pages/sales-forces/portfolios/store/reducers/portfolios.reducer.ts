import { Action, createReducer, on } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';
import { EntityState, createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { Portfolio } from '../../models/portfolios.model';
import { IErrorHandler } from 'app/shared/models';
import { PortfolioActions } from '../actions';


export const FEATURE_KEY = 'portfolios';

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

interface PortfolioState extends EntityState<Portfolio> {
    total: number;
}

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
    isLoading: boolean;
    portfolios: PortfolioState;
    selectedPortfolioId: string;
    errors: ErrorState;
}

const adapterPortfolio: EntityAdapter<Portfolio> = createEntityAdapter<Portfolio>({
    selectId: portfolio => portfolio.id,
});
const initialPortfolioState = adapterPortfolio.getInitialState({ total: 0, limit: 10, skip: 0, data: [] });

const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

export const initialState: State = {
    isLoading: false,
    portfolios: initialPortfolioState,
    selectedPortfolioId: null,
    errors: initialErrorState
};

const portfoliosReducer = createReducer(
    initialState,
    /**
     * REQUESTS
     */
    on(
        PortfolioActions.fetchPortfolioRequest,
        PortfolioActions.fetchPortfoliosRequest,
        (state) => ({
            ...state,
            isLoading: true
        })
    ),
    /**
     * FAILURES
     */
    on(
        PortfolioActions.fetchPortfolioRequest,
        PortfolioActions.fetchPortfoliosRequest,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            errors: adapterError.upsertOne(payload, state.errors)
        })
    ),
);

export function reducer(state: State | undefined, action: Action): State {
    return portfoliosReducer(state, action);
}
