import { createReducer, on } from '@ngrx/store';
import { EntityState, createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { environment } from '../../../../../../../environments/environment';
import { Portfolio } from '../../models/portfolios.model';
import { PortfolioActions } from '../actions';
import { Store } from 'app/main/pages/attendances/models';

// Set reducer's feature key
export const featureKey = 'portfolios';

interface PortfolioStoreState extends EntityState<Store> {
    isLoading: boolean;
    needRefresh: boolean;
    selectedIds: Array<string>;
    total: number;
}

export const adapterPortfolioStore: EntityAdapter<Store> = createEntityAdapter<Store>({
    selectId: store => store.id
});
const initialPortfolioStoreState = adapterPortfolioStore.getInitialState({
    isLoading: false,
    needRefresh: false,
    selectedIds: [],
    total: 0,
    limit: environment.pageSize,
    skip: 0,
    data: []
});

/**
 * Interface's state.
 */
export interface State extends EntityState<Portfolio> {
    isLoading: boolean;
    needRefresh: boolean;
    selectedIds: Array<string>;
    urlExport: string;
    stores: PortfolioStoreState;
    total: number;
}

// Entity Adapter for the Entity State.
export const adapter: EntityAdapter<Portfolio> = createEntityAdapter<Portfolio>({
    selectId: portfolio => portfolio.id,
});

// Set the reducer's initial state.
const initialState = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    needRefresh: false,
    selectedIds: [],
    urlExport: null,
    stores: initialPortfolioStoreState,
    total: 0,
});

// Create the reducer.
export const reducer = createReducer(
    initialState,
    on(
        PortfolioActions.exportPortfoliosRequest,
        PortfolioActions.fetchPortfolioRequest,
        PortfolioActions.fetchPortfoliosRequest,
        state => ({
            ...state,
            isLoading: true
        })
    ),
    on(
        PortfolioActions.exportPortfoliosSuccess,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            urlExport: payload
        })
    ),
    on(
        PortfolioActions.fetchPortfolioSuccess,
        (state, { payload }) =>
            adapter.upsertOne(payload.portfolio, {
                ...state,
                isLoading: false
            })
    ),
    on(
        PortfolioActions.fetchPortfoliosSuccess,
        (state, { payload }) =>
            adapter.addAll(payload.portfolios, {
                ...state,
                isLoading: false,
                total: payload.total
            })
    ),
    on(
        PortfolioActions.fetchPortfolioStoresRequest,
        state => ({
            ...state,
            stores: {
                ...state.stores,
                isLoading: true
            }
        })
    ),
    on(
        PortfolioActions.fetchPortfolioStoresSuccess,
        (state, { payload }) => ({
            ...state,
            stores: adapterPortfolioStore.addAll(payload.stores, {
                ...state.stores,
                isLoading: false
            })
        })
    ),
    on(
        PortfolioActions.truncatePortfolios,
        state => adapter.removeAll(state)
    )
);
